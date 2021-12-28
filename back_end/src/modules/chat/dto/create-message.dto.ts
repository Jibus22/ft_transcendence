import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length
} from 'class-validator';

export class createMessageDto {
  @ApiProperty()
  @IsString()
  @Length(1, 10000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 10000)
  @IsString()
  password: string;
}
