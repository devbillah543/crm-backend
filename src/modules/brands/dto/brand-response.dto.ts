import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  id!: string;

  @ApiProperty({ example: 'f7f5abdd-d2d3-427c-a3d7-66e3b74b407e' })
  organizationId!: string;

  @ApiPropertyOptional({ example: '7a76e0ec-bdf3-4503-b5cb-f0d2bfc48209' })
  parentBrandId!: string | null;

  @ApiProperty({ example: 'sidago-primary' })
  code!: string;

  @ApiProperty({ example: 'Sidago Primary' })
  displayName!: string;

  @ApiPropertyOptional({ example: '/storage/local/media/users/123/brands/sidago-primary-icon.png' })
  icon!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  updatedAt!: Date;
}
