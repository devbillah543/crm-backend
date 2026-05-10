import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'sidago', minLength: 2, maxLength: 32 })
  @IsString()
  @Length(2, 32)
  code!: string;

  @ApiProperty({ example: 'Sidago CRM', minLength: 2, maxLength: 128 })
  @IsString()
  @Length(2, 128)
  displayName!: string;

  @ApiPropertyOptional({
    example: 'Primary organization for internal CRM operations.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    example: '/storage/local/media/users/123/organizations/sidago-icon.png',
    maxLength: 512,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  icon?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
