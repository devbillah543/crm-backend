import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: [String] })
  errors?: unknown[];

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  path!: string;
}
