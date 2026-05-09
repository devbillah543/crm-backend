import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/jwt-user.type';
import type { AuthenticatedRequest } from './types/authenticated-request.type';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SessionsQueryDto } from './dto/sessions-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthService } from './services/auth.service';
import { AccountService } from './services/account.service';
import { AuthSessionService } from './services/auth-session.service';
import type { UploadedAvatar } from './types/uploaded-avatar.type';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user, creates a tracked device session, and returns access plus rotating refresh tokens.',
  })
  @ApiCreatedResponse({
    description: 'Login succeeded.',
    type: AuthResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  login(@Body() dto: LoginDto, @Req() request: AuthenticatedRequest) {
    return this.authService.login(dto, request);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Validates the submitted refresh token, rotates it, and returns a fresh access token plus replacement refresh token.',
  })
  @ApiOkResponse({
    description: 'Refresh succeeded.',
    type: AuthResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: AuthenticatedRequest) {
    return this.authService.refresh(dto, request);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns the current authenticated account profile and authorization context.',
  })
  @ApiOkResponse({
    description: 'Current account returned successfully.',
    type: ProfileResponseDto,
  })
  me(@CurrentUser() user: JwtUser) {
    return this.accountService.getMe(user);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout current session',
    description: 'Revokes the currently authenticated device session.',
  })
  @ApiOkResponse({
    description: 'Current session logged out.',
    schema: { example: { success: true, message: 'Current session logged out successfully' } },
  })
  async logoutCurrent(@CurrentUser() user: JwtUser) {
    await this.authSessionService.logoutCurrent(user);
    return { success: true, message: 'Current session logged out successfully' };
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all sessions',
    description: 'Revokes every active session for the current account.',
  })
  @ApiOkResponse({
    description: 'All sessions revoked.',
    schema: { example: { success: true, message: 'All sessions logged out successfully' } },
  })
  async logoutAll(@CurrentUser() user: JwtUser) {
    await this.authSessionService.logoutAll(user);
    return { success: true, message: 'All sessions logged out successfully' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email',
    description: 'Consumes an email verification token and marks the user email as verified.',
  })
  @ApiOkResponse({
    description: 'Email verified successfully.',
    schema: { example: { success: true, message: 'Email verified successfully' } },
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.token);
    return { success: true, message: result.message };
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Queues a new verification email for the authenticated user when needed.',
  })
  @ApiOkResponse({
    description: 'Verification email queued.',
    schema: { example: { success: true, message: 'Verification email queued successfully' } },
  })
  async resendVerificationEmail(@CurrentUser() user: JwtUser) {
    const result = await this.authService.resendVerificationEmail(user);
    return { success: true, message: result.message };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forgot password',
    description:
      'Queues a password reset message if the address exists, while returning a generic response to prevent account enumeration.',
  })
  @ApiOkResponse({
    description: 'Generic forgot-password response.',
    schema: {
      example: {
        success: true,
        message: 'If the email exists in our system, a password reset message has been queued.',
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return { success: true, message: result.message };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Consumes a password reset token and applies a new password.',
  })
  @ApiOkResponse({
    description: 'Password reset completed.',
    schema: { example: { success: true, message: 'Password reset successfully' } },
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return { success: true, message: result.message };
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({
    summary: 'List active sessions',
    description: 'Returns paginated active device sessions for the authenticated account.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Active sessions returned successfully.',
    type: SessionResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '79ed9f8c-f1e6-4793-9d8b-3e0adbe4cbda',
              deviceName: 'Jane Laptop',
              browser: 'Chrome',
              os: 'Windows',
              ipAddress: '203.0.113.10',
              location: 'Dhaka, BD',
              userAgent: 'Mozilla/5.0 ...',
              issuedAt: '2026-05-09T10:00:00.000Z',
              lastActiveAt: '2026-05-09T10:15:00.000Z',
              expiresAt: '2026-05-16T10:00:00.000Z',
              isCurrent: true,
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total: 1,
          },
        },
      },
    },
  })
  getSessions(@CurrentUser() user: JwtUser, @Query() query: SessionsQueryDto) {
    return this.authSessionService.listActiveSessions(user, query.page, query.limit);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete('sessions/:sessionId')
  @ApiOperation({
    summary: 'Revoke a specific session',
    description: 'Revokes the selected device session for the authenticated user.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session identifier to revoke.' })
  @ApiOkResponse({
    description: 'Session revoked successfully.',
    schema: { example: { success: true, message: 'Session revoked successfully' } },
  })
  async revokeSession(@CurrentUser() user: JwtUser, @Param('sessionId') sessionId: string) {
    await this.authSessionService.revokeSpecificSession(user, sessionId);
    return { success: true, message: 'Session revoked successfully' };
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update one or more profile fields. Avatar is optional multipart file upload.',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Jane' },
        lastName: { type: 'string', example: 'Doe' },
        fullName: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', format: 'email', example: 'jane.doe@sidago.com' },
        currentPassword: { type: 'string', example: 'StrongPassword!123' },
        newPassword: { type: 'string', example: 'BrandNewPassword!123' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Update profile',
    description:
      'Updates name, email, password, or avatar individually or together. Password changes require the current password.',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully.',
    type: ProfileResponseDto,
  })
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: UploadedAvatar,
  ) {
    return this.accountService.updateProfile(user, dto, avatar);
  }
}
