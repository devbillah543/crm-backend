import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { STORAGE_DRIVER, STORAGE_DRIVER_NAME, StorageService } from './storage.service';
import type { StorageDriverName } from './storage.types';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageDriver,
    S3StorageDriver,
    {
      provide: STORAGE_DRIVER_NAME,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): StorageDriverName => {
        const driver = configService.get<string>('storage.driver', 'local');

        if (driver !== 'local' && driver !== 's3') {
          throw new Error(`Unsupported storage driver: ${driver}`);
        }

        return driver;
      },
    },
    {
      provide: STORAGE_DRIVER,
      inject: [STORAGE_DRIVER_NAME, LocalStorageDriver, S3StorageDriver],
      useFactory: (
        driverName: StorageDriverName,
        localStorageDriver: LocalStorageDriver,
        s3StorageDriver: S3StorageDriver,
      ) => {
        switch (driverName) {
          case 'local':
            return localStorageDriver;
          case 's3':
            return s3StorageDriver;
        }
      },
    },
    StorageService,
  ],
  exports: [StorageService, STORAGE_DRIVER, STORAGE_DRIVER_NAME],
})
export class StorageModule {}
