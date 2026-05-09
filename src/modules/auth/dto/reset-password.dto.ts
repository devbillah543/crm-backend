import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token sent by email.',
    example: '4a12c7d6787b461ca4d3172c542c8f93',
  })
  @IsString()
  @MinLength(16)
  token!: string;

  @ApiProperty({
    description: 'New password to apply.',
    example: 'AnotherStrongPassword!123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
