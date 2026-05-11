import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../../core/cache/cache.module';
import { Brand } from '../../database/entities/brand.entity';
import { Organization } from '../../database/entities/organization.entity';
import { AuthModule } from '../auth/auth.module';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand, Organization]),
    CacheModule,
    AuthModule,
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
