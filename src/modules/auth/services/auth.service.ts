import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import type { JwtUser } from '../../../common/types/jwt-user.type';
import { QueueService } from '../../../core/queue/queue.service';
import { StorageService } from '../../../core/storage/storage.service';
import { User } from '../../../database/entities/user.entity';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserRepository } from '../repositories/user.repository';
import { AuthAuditService } from './auth-audit.service';
import { AuthMailTemplateService } from './auth-mail-template.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  private readonly dummyPasswordHash =
    '$2b$12$7Vd7LwQ2M/JD3QGJ0z0N4O0WkBI7Xq8J3QfOFvLx8tkgM1tW9NSSu';

  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly storageService: StorageService,
    private readonly userRepository: UserRepository,
    private readonly authAuditService: AuthAuditService,
    private readonly authMailTemplateService: AuthMailTemplateService,
    private readonly authSessionService: AuthSessionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async login(dto: LoginDto, request: AuthenticatedRequest) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      await compare(dto.password, this.dummyPasswordHash);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const matches = await compare(dto.password, user.passwordHash);
    if (!matches) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.failedLoginCount = 0;
    user.lastFailedLoginAt = null;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const { tokens } = await this.authSessionService.createLoginSession(user, request);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(dto: RefreshTokenDto, request: AuthenticatedRequest) {
    const { tokens } = await this.authSessionService.refresh(dto.refreshToken, request);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getMe(currentUser: JwtUser) {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.userRepository.getRoleCodes(user.id);
    const permissions = await this.userRepository.getPermissionCodes(user.id);
    return this.serializeUser(user, roles, permissions);
  }

  async resendVerificationEmail(currentUser: JwtUser) {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    const token = await this.authTokenService.createToken(user, 'email_verification');
    user.verificationEmailSentAt = new Date();
    await this.userRepository.save(user);

    const verifyUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/verify-email?token=${token}`;
    const template = this.authMailTemplateService.buildVerificationEmail(
      user.fullName ?? user.email,
      verifyUrl,
    );
    await this.queueService.enqueueMail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    return { message: 'Verification email queued successfully' };
  }

  async verifyEmail(token: string) {
    const actionToken = await this.authTokenService.consumeToken(token, 'email_verification');
    const user = await this.userRepository.findById(actionToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerifiedAt = new Date();
    await this.userRepository.save(user);
    await this.authAuditService.log(user.id, 'UPDATE', 'email_verified', {
      verifiedAt: user.emailVerifiedAt.toISOString(),
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    if (user) {
      const token = await this.authTokenService.createToken(user, 'password_reset');
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/reset-password?token=${token}`;
      const template = this.authMailTemplateService.buildPasswordResetEmail(
        user.fullName ?? user.email,
        resetUrl,
      );
      await this.queueService.enqueueMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
      await this.authAuditService.log(user.id, 'AUTH', 'forgot_password_requested', {
        email: user.email,
      });
    }

    return {
      message:
        'If the email exists in our system, a password reset message has been queued.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const actionToken = await this.authTokenService.consumeToken(dto.token, 'password_reset');
    const user = await this.userRepository.findById(actionToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await hash(
      dto.newPassword,
      this.configService.get<number>('auth.bcryptRounds', 12),
    );
    user.passwordChangedAt = new Date();
    user.failedLoginCount = 0;
    user.lastFailedLoginAt = null;
    user.lockedUntil = null;
    await this.userRepository.save(user);
    await this.authSessionService.logoutAll({
      userId: user.id,
      email: user.email,
      sessionId: '',
    });
    await this.authAuditService.log(user.id, 'UPDATE', 'password_reset_completed', {
      changedAt: user.passwordChangedAt.toISOString(),
    });

    return { message: 'Password reset successfully' };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const maxFailedLogins = this.configService.get<number>('auth.maxFailedLogins', 5);
    const lockMinutes = this.configService.get<number>('auth.lockMinutes', 15);
    user.failedLoginCount += 1;
    user.lastFailedLoginAt = new Date();

    if (user.failedLoginCount >= maxFailedLogins) {
      user.lockedUntil = new Date(Date.now() + lockMinutes * 60_000);
    }

    await this.userRepository.save(user);
    await this.authAuditService.log(user.id, 'AUTH', 'failed_login', {
      failedLoginCount: user.failedLoginCount,
      lockedUntil: user.lockedUntil?.toISOString() ?? null,
    });
  }

  private serializeUser(user: User, roles: string[], permissions: string[]) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
      avatarUrl: user.avatarKey ? this.storageService.url(user.avatarKey) : null,
      roles,
      permissions,
    };
  }
}
