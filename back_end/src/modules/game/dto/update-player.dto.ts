import { IsNumber } from 'class-validator';

export class UpdatePlayerDto {
  @IsNumber()
  score: number;
}
