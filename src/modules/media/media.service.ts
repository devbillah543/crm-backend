import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { StorageService } from '../../core/storage/storage.service';
import type { UploadedMedia } from './types/uploaded-media.type';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  async upload(user: JwtUser, file: UploadedMedia, dto: UploadMediaDto) {
    this.validateFile(file);

    const folder = dto.folder?.trim().replace(/^\/+|\/+$/g, '') || 'uploads';
    const key = `media/users/${user.userId}/${folder}/${randomUUID()}${extname(file.originalname || '.bin')}`;
    const savedFile = await this.storageService.putBuffer(key, file.buffer, {
      contentType: file.mimetype,
    });

    return {
      key: savedFile.key,
      url: savedFile.url,
      size: savedFile.size,
      contentType: savedFile.contentType,
    };
  }

  private validateFile(file?: UploadedMedia): asserts file is UploadedMedia {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize = this.configService.get<number>('auth.avatarMaxSizeBytes', 5_242_880);
    if (file.size > maxSize) {
      throw new BadRequestException(`File exceeds ${maxSize} bytes`);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
  }
}
