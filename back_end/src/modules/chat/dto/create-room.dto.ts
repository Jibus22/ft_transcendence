import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateParticipantDto } from './create-participant.dto';

export class CreateRoomDto {
  @ApiProperty()
  @IsArray()
  participants: CreateParticipantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsBoolean()
  is_private: boolean;
}
