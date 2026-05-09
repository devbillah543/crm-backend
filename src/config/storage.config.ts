import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  driver: process.env.STORAGE_DRIVER ?? 'local',
  local: {
    root: process.env.STORAGE_LOCAL_ROOT ?? 'storage/local',
    baseUrl: process.env.STORAGE_LOCAL_BASE_URL ?? '/storage/local',
  },
  s3: {
    bucket: process.env.STORAGE_S3_BUCKET,
    region: process.env.STORAGE_S3_REGION,
    endpoint: process.env.STORAGE_S3_ENDPOINT,
    publicBaseUrl: process.env.STORAGE_S3_PUBLIC_BASE_URL,
    forcePathStyle: String(process.env.STORAGE_S3_FORCE_PATH_STYLE ?? 'false') === 'true',
    prefix: process.env.STORAGE_S3_PREFIX ?? '',
    accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
  },
}));
