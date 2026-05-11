import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../../core/cache/cache.module';
import { Role } from '../../database/entities/role.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), CacheModule, AuthModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
