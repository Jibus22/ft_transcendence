import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsString } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsString()
  map: string;
}
