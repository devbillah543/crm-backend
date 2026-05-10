import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthActionToken } from '../../database/entities/auth-action-token.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RolePermission } from '../../database/entities/role-permission.entity';
import { Role } from '../../database/entities/role.entity';
import { UserRoleAssignment } from '../../database/entities/user-role-assignment.entity';
import { UserSession } from '../../database/entities/user-session.entity';
import { User } from '../../database/entities/user.entity';
import { AccessTokenGuard } from './guards/access-token.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountService } from './services/account.service';
import { AuthAuditService } from './services/auth-audit.service';
import { AuthMailTemplateService } from './services/auth-mail-template.service';
import { AuthService } from './services/auth.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthTokenService } from './services/auth-token.service';
import { DeviceMetadataService } from './services/device-metadata.service';
import { UserRepository } from './repositories/user.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { AuthActionTokenRepository } from './repositories/auth-action-token.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuthSessionCleanupCron } from './cron/auth-session-cleanup.cron';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.accessSecret'),
      }),
    }),
    TypeOrmModule.forFeature([
      AuthActionToken,
      AuditLog,
      Permission,
      Role,
      RolePermission,
      User,
      UserRoleAssignment,
      UserSession,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AccessTokenGuard,
    RolesGuard,
    PermissionsGuard,
    AccountService,
    AuthAuditService,
    AuthMailTemplateService,
    AuthService,
    AuthSessionCleanupCron,
    AuthSessionService,
    AuthTokenService,
    DeviceMetadataService,
    UserRepository,
    UserSessionRepository,
    AuthActionTokenRepository,
    AuditLogRepository,
  ],
  exports: [AccessTokenGuard, AuthSessionService, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
