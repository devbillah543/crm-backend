import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseHealthService } from './database.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<boolean>('database.logging', false),
        extra: {
          min: configService.get<number>('database.poolMin', 2),
          max: configService.get<number>('database.poolMax', 20),
        },
        ssl: configService.get<boolean>('database.ssl', false)
          ? { rejectUnauthorized: false }
          : false,
        entities: [],
      }),
    }),
  ],
  providers: [DatabaseHealthService],
  exports: [DatabaseHealthService, TypeOrmModule],
})
export class DatabaseModule {}
