import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({ example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  id!: string;

  @ApiProperty({ example: 'AAPL' })
  companySymbol!: string;

  @ApiProperty({ example: 'Apple Inc.' })
  companyName!: string;

  @ApiPropertyOptional({ example: 'Public' })
  companyType!: string | null;

  @ApiPropertyOptional({ example: 'APPL' })
  previousCompanySymbol!: string | null;

  @ApiPropertyOptional({ example: 'Apple Computer, Inc.' })
  previousCompanyName!: string | null;

  @ApiPropertyOptional({ example: '037833100' })
  cusip!: string | null;

  @ApiPropertyOptional({ example: '320193' })
  cik!: string | null;

  @ApiPropertyOptional({ example: 'United States' })
  country!: string | null;

  @ApiPropertyOptional({ example: 'Cupertino' })
  city!: string | null;

  @ApiPropertyOptional({ example: 'California' })
  state!: string | null;

  @ApiPropertyOptional({ example: '95014' })
  zip!: string | null;

  @ApiPropertyOptional({ example: 'America/Los_Angeles' })
  timezone!: string | null;

  @ApiPropertyOptional({ example: 'https://www.apple.com' })
  website!: string | null;

  @ApiPropertyOptional({ example: '/storage/local/media/users/123/companies/apple-icon.png' })
  icon!: string | null;

  @ApiPropertyOptional({ example: '@apple' })
  twitter!: string | null;

  @ApiPropertyOptional({ example: 'Consumer electronics and software company.' })
  description!: string | null;

  @ApiPropertyOptional({ example: '3200000000000.00' })
  estimatedMarketcap!: string | null;

  @ApiPropertyOptional({ example: 'd4e8b03b-fb64-4d8e-98e5-291016cf519d' })
  createdByUserId!: string | null;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-10T16:32:11.000Z' })
  updatedAt!: Date;
}
