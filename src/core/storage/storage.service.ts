import { Inject, Injectable } from '@nestjs/common';
import type { StorageDriver, StorageDriverName, StorageFile, StoragePutInput } from './storage.types';

export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');
export const STORAGE_DRIVER_NAME = Symbol('STORAGE_DRIVER_NAME');

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_DRIVER) private readonly driver: StorageDriver,
    @Inject(STORAGE_DRIVER_NAME) private readonly driverName: StorageDriverName,
  ) {}

  get activeDriver(): StorageDriverName {
    return this.driverName;
  }

  async put(input: StoragePutInput): Promise<StorageFile> {
    return this.driver.put(input);
  }

  async putBuffer(
    key: string,
    body: Buffer,
    options?: Omit<StoragePutInput, 'key' | 'body'>,
  ): Promise<StorageFile> {
    return this.driver.put({
      key,
      body,
      contentType: options?.contentType,
      metadata: options?.metadata,
    });
  }

  async delete(key: string): Promise<void> {
    await this.driver.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.driver.exists(key);
  }

  async read(key: string): Promise<Buffer> {
    return this.driver.read(key);
  }

  url(key: string): string {
    return this.driver.url(key);
  }
}
