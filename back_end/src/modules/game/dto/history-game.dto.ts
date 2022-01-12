import { IsUUID } from 'class-validator';
import { IsInt, Max } from 'class-validator';

export class RegularPlayerDto {
  @IsUUID()
  id: string;
  login: string;
  photo_url: string;
  @IsInt()
  @Max(10)
  score: number;

  public constructor(
    id: string,
    login: string,
    photo_url: string,
    score: number,
  ) {
    this.id = id;
    this.login = login;
    this.photo_url = photo_url;
    this.score = score;
  }
}

export class HistoryGameDto {
  players: RegularPlayerDto[];
  date: Date;
  duration: number;

  public constructor(
    players?: RegularPlayerDto[],
    date?: Date,
    duration?: number,
  ) {
    this.players = players;
    this.date = date;
    this.duration = duration;
  }
}
