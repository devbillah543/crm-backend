import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  IsNumberString,
  IsUrl,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'AAPL', minLength: 1, maxLength: 16 })
  @IsString()
  @Length(1, 16)
  companySymbol!: string;

  @ApiProperty({ example: 'Apple Inc.', minLength: 2, maxLength: 255 })
  @IsString()
  @Length(2, 255)
  companyName!: string;

  @ApiPropertyOptional({ example: 'Public', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  companyType?: string;

  @ApiPropertyOptional({ example: 'APPL', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  previousCompanySymbol?: string;

  @ApiPropertyOptional({ example: 'Apple Computer, Inc.', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  previousCompanyName?: string;

  @ApiPropertyOptional({ example: '037833100', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  cusip?: string;

  @ApiPropertyOptional({ example: '320193', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  cik?: string;

  @ApiPropertyOptional({ example: 'United States', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  country?: string;

  @ApiPropertyOptional({ example: 'Cupertino', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  city?: string;

  @ApiPropertyOptional({ example: 'California', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  state?: string;

  @ApiPropertyOptional({ example: '95014', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  zip?: string;

  @ApiPropertyOptional({ example: 'America/Los_Angeles', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ example: 'https://www.apple.com' })
  @IsOptional()
  @IsUrl()
  @MaxLength(512)
  website?: string;

  @ApiPropertyOptional({
    example: '/storage/local/media/users/123/companies/apple-icon.png',
    maxLength: 512,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  icon?: string;

  @ApiPropertyOptional({ example: '@apple', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  twitter?: string;

  @ApiPropertyOptional({ example: 'Consumer electronics and software company.', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: '3200000000000.00' })
  @IsOptional()
  @IsNumberString()
  estimatedMarketcap?: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Reserved for future use.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
    description: 'Ignored on create and derived from the authenticated user.',
  })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}
