import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    example: '7a76e0ec-bdf3-4503-b5cb-f0d2bfc48209',
  })
  id!: string;

  @ApiProperty({ example: 'admin' })
  code!: string;

  @ApiPropertyOptional({ example: 'Admin' })
  displayName!: string | null;

  @ApiPropertyOptional({
    example: 'Administrative access across all CRM modules and operations.',
  })
  description!: string | null;

  @ApiProperty({ example: true })
  isSystem!: boolean;
}
