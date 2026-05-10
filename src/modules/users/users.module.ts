import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthActionToken } from '../../database/entities/auth-action-token.entity';
import { Brand } from '../../database/entities/brand.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RolePermission } from '../../database/entities/role-permission.entity';
import { Role } from '../../database/entities/role.entity';
import { UserBrand } from '../../database/entities/user-brand.entity';
import { UserRoleAssignment } from '../../database/entities/user-role-assignment.entity';
import { UserSession } from '../../database/entities/user-session.entity';
import { User } from '../../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRoleAssignment,
      UserBrand,
      Brand,
      RolePermission,
      Permission,
      UserSession,
      AuthActionToken,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
