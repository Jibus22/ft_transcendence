import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsInt, Max } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsInt()
  @Max(10)
  scoreP1: number;
  @IsInt()
  @Max(10)
  scoreP2: number;
}
