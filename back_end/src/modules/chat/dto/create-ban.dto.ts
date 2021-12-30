import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsUUID } from 'class-validator';

export class CreateBanDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsDate()
  expiration_time: number;
}
