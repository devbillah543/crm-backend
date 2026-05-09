import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { LocalStorageDriver } from './local-storage.driver';

describe('LocalStorageDriver', () => {
  let rootDir: string;
  let driver: LocalStorageDriver;

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'sidago-storage-'));
    driver = new LocalStorageDriver({
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'storage.local.root') {
          return rootDir;
        }

        if (key === 'storage.local.baseUrl') {
          return '/files';
        }

        return fallback;
      }),
    } as never);
  });

  afterEach(async () => {
    await rm(rootDir, { recursive: true, force: true });
  });

  it('stores and reads a file within the configured root', async () => {
    const input = {
      key: 'nested/file.txt',
      body: Buffer.from('hello world'),
      contentType: 'text/plain',
    };

    await expect(driver.put(input)).resolves.toMatchObject({
      key: 'nested/file.txt',
      contentType: 'text/plain',
      url: '/files/nested/file.txt',
    });

    await expect(driver.exists(input.key)).resolves.toBe(true);
    await expect(driver.read(input.key)).resolves.toEqual(Buffer.from('hello world'));
  });

  it('rejects path traversal outside the storage root', async () => {
    await expect(driver.put({ key: '../escape.txt', body: Buffer.from('x') })).rejects.toThrow(
      'Storage key resolves outside local storage root',
    );
  });
});
