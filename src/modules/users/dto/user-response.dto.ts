import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  id!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'Platform' })
  firstName!: string | null;

  @ApiPropertyOptional({ example: 'Admin' })
  lastName!: string | null;

  @ApiPropertyOptional({ example: 'Platform Admin' })
  fullName!: string | null;

  @ApiPropertyOptional({ example: '/storage/local/media/users/123/avatar.png' })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ example: '2026-05-10T16:32:11.000Z' })
  lastLoginAt!: string | null;

  @ApiPropertyOptional({ example: '2026-05-10T16:32:11.000Z' })
  emailVerifiedAt!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: [String], example: ['admin'] })
  roles!: string[];

  @ApiProperty({ type: [String], example: ['user.read', 'user.manage'] })
  permissions!: string[];

  @ApiProperty({ type: [String], example: ['de305d54-75b4-431b-adb2-eb6b9e546014'] })
  brandIds!: string[];

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  updatedAt!: string;
}
