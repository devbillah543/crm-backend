import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jane.doe@sidago.com',
    description: 'User email address.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongPassword!123',
    description: 'User password.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
