import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class createMessageDto {
  @ApiProperty()
  @IsString()
  @Length(1, 10000)
  body: string;
}
