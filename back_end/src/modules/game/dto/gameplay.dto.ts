export class BroadcastDto {
  room: string;
  watchers: string;
}

export class ScoreDto {
  score1: number;
  score2: number;
}

export class BallPosDto {
  x: number;
  y: number;
}

export class PowerUpDto {
  effect: string;
  playerNb: number;
}

export class GamePlayerDto {
  y: number;
  size: number;
  name: string;
  num: number;
  keyUp: string;
  keyDown: string;
  defaultSize: number;
  width: number;
  x: number;
}
