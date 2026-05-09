import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({
    description: 'Optional folder name inside the current user media directory.',
    example: 'avatars',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-zA-Z0-9/_-]+$/, {
    message: 'folder may only contain letters, numbers, slash, underscore, and hyphen',
  })
  folder?: string;
}
