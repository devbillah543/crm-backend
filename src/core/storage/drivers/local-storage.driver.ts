import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, resolve, sep } from 'path';
import type { StorageDriver, StorageFile, StoragePutInput } from '../storage.types';

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly rootDirectory: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rootDirectory = resolve(
      process.cwd(),
      this.configService.get<string>('storage.local.root', 'storage/local'),
    );
    this.baseUrl = this.normalizeBaseUrl(
      this.configService.get<string>('storage.local.baseUrl', '/storage/local'),
    );
  }

  async put(input: StoragePutInput): Promise<StorageFile> {
    const filePath = this.resolvePath(input.key);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);

    const fileStat = await stat(filePath);

    return {
      key: this.normalizeKey(input.key),
      size: fileStat.size,
      contentType: input.contentType,
      url: this.url(input.key),
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(this.resolvePath(key));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolvePath(key));
  }

  url(key: string): string {
    return `${this.baseUrl}/${this.normalizeKey(key)}`;
  }

  private resolvePath(key: string): string {
    const normalizedKey = this.normalizeKey(key);
    const filePath = resolve(this.rootDirectory, normalizedKey);
    const rootWithSeparator = `${this.rootDirectory}${sep}`;

    if (filePath !== this.rootDirectory && !filePath.startsWith(rootWithSeparator)) {
      throw new Error(`Storage key resolves outside local storage root: ${key}`);
    }

    return filePath;
  }

  private normalizeKey(key: string): string {
    return key.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  private normalizeBaseUrl(baseUrl: string): string {
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
}
