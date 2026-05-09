import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({ example: '79ed9f8c-f1e6-4793-9d8b-3e0adbe4cbda' })
  id!: string;

  @ApiProperty({ example: 'Jane Laptop', nullable: true })
  deviceName!: string | null;

  @ApiProperty({ example: 'Chrome', nullable: true })
  browser!: string | null;

  @ApiProperty({ example: 'Windows', nullable: true })
  os!: string | null;

  @ApiProperty({ example: '203.0.113.10', nullable: true })
  ipAddress!: string | null;

  @ApiProperty({ example: 'Dhaka, BD', nullable: true })
  location!: string | null;

  @ApiProperty({ example: 'Mozilla/5.0 ...', nullable: true })
  userAgent!: string | null;

  @ApiProperty({ example: '2026-05-09T10:00:00.000Z' })
  issuedAt!: string;

  @ApiProperty({ example: '2026-05-09T10:10:00.000Z' })
  lastActiveAt!: string;

  @ApiProperty({ example: '2026-05-16T10:00:00.000Z' })
  expiresAt!: string | null;

  @ApiProperty({ example: false })
  isCurrent!: boolean;
}
