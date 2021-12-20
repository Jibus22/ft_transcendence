import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsInt } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsInt()
  scoreP1: number;
  @IsInt()
  scoreP2: number;
}
