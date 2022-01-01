import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateParticipantDto } from './create-participant.dto';

export class UpdatePasswordDto {

  @ApiProperty()
  @IsString()
  password: string;

}
