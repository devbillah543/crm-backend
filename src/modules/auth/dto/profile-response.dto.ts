import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ example: '0f1fcbf8-c02f-4ddf-9d8c-5379f8316183' })
  id!: string;

  @ApiProperty({ example: 'jane.doe@sidago.com' })
  email!: string;

  @ApiProperty({ example: 'Jane', nullable: true })
  firstName!: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName!: string | null;

  @ApiProperty({ example: 'Jane Doe', nullable: true })
  fullName!: string | null;

  @ApiProperty({ example: '2026-05-09T10:00:00.000Z', nullable: true })
  emailVerifiedAt!: string | null;

  @ApiProperty({ example: '/storage/local/avatars/users/123/avatar.webp', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ type: [String], example: ['admin'] })
  roles!: string[];

  @ApiProperty({ type: [String], example: ['users.read', 'users.write'] })
  permissions!: string[];
}
