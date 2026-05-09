import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import type { StorageDriver, StorageFile, StoragePutInput } from '../storage.types';

@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket?: string;
  private readonly prefix: string;
  private readonly publicBaseUrl?: string;
  private readonly endpoint?: string;
  private readonly region?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('storage.s3.bucket');
    this.prefix = this.normalizePrefix(this.configService.get<string>('storage.s3.prefix', ''));
    this.publicBaseUrl = this.configService.get<string>('storage.s3.publicBaseUrl') || undefined;
    this.endpoint = this.configService.get<string>('storage.s3.endpoint') || undefined;
    this.region = this.configService.get<string>('storage.s3.region') || undefined;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: this.configService.get<boolean>('storage.s3.forcePathStyle', false),
      credentials: {
        accessKeyId: this.configService.get<string>('storage.s3.accessKeyId') || '',
        secretAccessKey: this.configService.get<string>('storage.s3.secretAccessKey') || '',
      },
    });
  }

  async put(input: StoragePutInput): Promise<StorageFile> {
    const bucket = this.getBucket();
    const objectKey = this.resolveObjectKey(input.key);

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: input.body,
        ContentType: input.contentType,
        Metadata: input.metadata,
      }),
    );

    return {
      key: this.normalizeKey(input.key),
      size: input.body.length,
      contentType: input.contentType,
      url: this.url(input.key),
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.getBucket(),
        Key: this.resolveObjectKey(key),
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.getBucket(),
          Key: this.resolveObjectKey(key),
        }),
      );

      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  async read(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.getBucket(),
        Key: this.resolveObjectKey(key),
      }),
    );

    if (!response.Body) {
      throw new Error(`S3 object has no body: ${key}`);
    }

    return this.streamToBuffer(response.Body as Readable);
  }

  url(key: string): string {
    const bucket = this.getBucket();
    const region = this.getRegion();
    const normalizedKey = this.normalizeKey(key);
    const objectKey = this.resolveObjectKey(normalizedKey);

    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/+$/, '')}/${objectKey}`;
    }

    if (this.endpoint) {
      const normalizedEndpoint = this.endpoint.replace(/\/+$/, '');
      return `${normalizedEndpoint}/${bucket}/${objectKey}`;
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
  }

  private resolveObjectKey(key: string): string {
    const normalizedKey = this.normalizeKey(key);
    return this.prefix ? `${this.prefix}/${normalizedKey}` : normalizedKey;
  }

  private normalizeKey(key: string): string {
    return key.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  private normalizePrefix(prefix: string): string {
    return prefix.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const namedError = error as Error & { name?: string; $metadata?: { httpStatusCode?: number } };
    return (
      namedError.name === 'NotFound' ||
      namedError.name === 'NoSuchKey' ||
      namedError.$metadata?.httpStatusCode === 404
    );
  }

  private getBucket(): string {
    if (!this.bucket || !this.region) {
      throw new Error('S3 storage is not fully configured. Check STORAGE_S3_BUCKET and STORAGE_S3_REGION.');
    }

    return this.bucket;
  }

  private getRegion(): string {
    if (!this.bucket || !this.region) {
      throw new Error('S3 storage is not fully configured. Check STORAGE_S3_BUCKET and STORAGE_S3_REGION.');
    }

    return this.region;
  }
}
