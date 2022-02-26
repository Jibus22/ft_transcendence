import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsString()
  map: string;
  @IsUUID()
  watch: string;
  updatedAt: number;
}
