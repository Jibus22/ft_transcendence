import { IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  login_opponent: string;
}
