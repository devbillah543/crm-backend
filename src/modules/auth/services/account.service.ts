import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { JwtUser } from '../../../common/types/jwt-user.type';
import { QueueService } from '../../../core/queue/queue.service';
import { StorageService } from '../../../core/storage/storage.service';
import { User } from '../../../database/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { AuthAuditService } from './auth-audit.service';
import { AuthMailTemplateService } from './auth-mail-template.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import type { UploadedAvatar } from '../types/uploaded-avatar.type';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly queueService: QueueService,
    private readonly userRepository: UserRepository,
    private readonly authAuditService: AuthAuditService,
    private readonly authMailTemplateService: AuthMailTemplateService,
    private readonly authSessionService: AuthSessionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async getMe(user: JwtUser) {
    const entity = await this.userRepository.findById(user.userId);
    if (!entity) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.userRepository.getRoleCodes(entity.id);
    const permissions = await this.userRepository.getPermissionCodes(entity.id);

    return this.serializeUser(entity, roles, permissions);
  }

  async updateProfile(
    currentUser: JwtUser,
    dto: UpdateProfileDto,
    avatar?: UploadedAvatar,
  ) {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.newPassword && !dto.currentPassword) {
      throw new BadRequestException('Current password is required when changing password');
    }

    if (dto.currentPassword && dto.newPassword) {
      const valid = user.passwordHash ? await compare(dto.currentPassword, user.passwordHash) : false;
      if (!valid) {
        throw new ForbiddenException('Current password is incorrect');
      }

      user.passwordHash = await hash(
        dto.newPassword,
        this.configService.get<number>('auth.bcryptRounds', 12),
      );
      user.passwordChangedAt = new Date();
      await this.authSessionService.revokeOtherSessionsForPasswordChange(currentUser);
      await this.authAuditService.log(currentUser.userId, 'UPDATE', 'password_changed', {
        changedAt: user.passwordChangedAt.toISOString(),
      });
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email.toLowerCase());
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Email is already in use');
      }

      const oldEmail = user.email;
      user.email = dto.email.toLowerCase();
      user.emailVerifiedAt = null;
      user.verificationEmailSentAt = new Date();
      const verifyToken = await this.authTokenService.createToken(user, 'email_verification');
      const verifyUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/verify-email?token=${verifyToken}`;
      const template = this.authMailTemplateService.buildVerificationEmail(
        user.fullName ?? user.email,
        verifyUrl,
      );
      await this.queueService.enqueueMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
      await this.authAuditService.log(currentUser.userId, 'UPDATE', 'email_changed', {
        oldEmail,
        newEmail: user.email,
      });
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName || null;
    }

    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName || null;
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName || null;
    } else if (dto.firstName !== undefined || dto.lastName !== undefined) {
      user.fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    }

    if (avatar) {
      this.validateAvatar(avatar);
      const nextKey = `avatars/users/${user.id}/${randomUUID()}${extname(avatar.originalname || '.bin')}`;
      await this.storageService.putBuffer(nextKey, avatar.buffer, {
        contentType: avatar.mimetype,
      });
      if (user.avatarKey) {
        await this.storageService.delete(user.avatarKey);
      }
      user.avatarKey = nextKey;
      await this.authAuditService.log(currentUser.userId, 'UPDATE', 'avatar_changed', {
        avatarKey: nextKey,
      });
    }

    await this.userRepository.save(user);

    const roles = await this.userRepository.getRoleCodes(user.id);
    const permissions = await this.userRepository.getPermissionCodes(user.id);

    return this.serializeUser(user, roles, permissions);
  }

  private validateAvatar(file: UploadedAvatar): void {
    const maxSize = this.configService.get<number>('auth.avatarMaxSizeBytes', 5_242_880);
    if (file.size > maxSize) {
      throw new BadRequestException(`Avatar exceeds ${maxSize} bytes`);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Avatar must be an image');
    }
  }

  private serializeUser(user: User, roles: string[], permissions: string[]) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
      avatarUrl: user.avatarKey ? this.storageService.url(user.avatarKey) : null,
      roles,
      permissions,
    };
  }
}
