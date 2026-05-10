import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  @IsUUID()
  organizationId!: string;

  @ApiPropertyOptional({ example: '7a76e0ec-bdf3-4503-b5cb-f0d2bfc48209' })
  @IsOptional()
  @IsUUID()
  parentBrandId?: string;

  @ApiProperty({ example: 'sidago-primary', minLength: 2, maxLength: 32 })
  @IsString()
  @Length(2, 32)
  code!: string;

  @ApiProperty({ example: 'Sidago Primary', minLength: 2, maxLength: 128 })
  @IsString()
  @Length(2, 128)
  displayName!: string;

  @ApiPropertyOptional({
    example: '/storage/local/media/users/123/brands/sidago-primary-icon.png',
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
