import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({ example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  id!: string;

  @ApiProperty({ example: 'sidago' })
  code!: string;

  @ApiProperty({ example: 'Sidago CRM' })
  displayName!: string;

  @ApiPropertyOptional({ example: 'Primary organization for internal CRM operations.' })
  description!: string | null;

  @ApiPropertyOptional({
    example: '/storage/local/media/users/123/organizations/sidago-icon.png',
  })
  icon!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  updatedAt!: Date;
}
