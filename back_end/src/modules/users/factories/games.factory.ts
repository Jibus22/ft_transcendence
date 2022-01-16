import { define } from 'typeorm-seeding';
import { Game } from '../../game/entities/game.entity';

define(Game, () => {
  const game = new Game();
  game.updatedAt = Date.now() - (1000 * 60 * 60 * (Math.round(Math.random() * 100)));
  game.createdAt = game.updatedAt - (1000 * 60 * Math.round(Math.random() * 10));
  return game;
});
