import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token sent to the user inbox.',
    example: '0f7d7f412fd24786b8d8f930d6596807',
  })
  @IsString()
  @MinLength(16)
  token!: string;
}
