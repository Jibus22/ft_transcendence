import { define } from 'typeorm-seeding';
import { Game } from '../../game/entities/game.entity';

var faker = require('faker');

define(Game, () => {
  const game = new Game();
  const randomOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365);
  game.updatedAt = faker.time.recent() - randomOffset;
  game.createdAt =
    game.updatedAt - 1000 * 60 * Math.floor(Math.random() * 10) + 2;
  return game;
});
