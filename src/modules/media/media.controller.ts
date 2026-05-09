import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UploadMediaDto } from './dto/upload-media.dto';
import type { UploadedMedia } from './types/uploaded-media.type';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image and receive a storage key and URL that can be reused in other APIs.',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Upload media',
    description:
      'Uploads an image for the authenticated user and returns the storage key and URL.',
  })
  @ApiCreatedResponse({
    description: 'Media uploaded successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          key: 'media/users/123/avatars/abc.png',
          url: '/storage/local/media/users/123/avatars/abc.png',
          size: 1024,
          contentType: 'image/png',
        },
      },
    },
  })
  upload(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file: UploadedMedia,
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.upload(user, file, dto);
  }
}
