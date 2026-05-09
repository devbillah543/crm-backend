export type StorageDriverName = 'local' | 's3';

export interface StoragePutInput {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageFile {
  key: string;
  size: number;
  contentType?: string;
  url: string;
}

export interface StorageDriver {
  put(input: StoragePutInput): Promise<StorageFile>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  read(key: string): Promise<Buffer>;
  url(key: string): string;
}
