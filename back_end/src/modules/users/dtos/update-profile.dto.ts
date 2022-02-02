import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  login: string;
}
