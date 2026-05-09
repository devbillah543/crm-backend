import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address to receive the password reset link.',
    example: 'jane.doe@sidago.com',
  })
  @IsEmail()
  email!: string;
}
