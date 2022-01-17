import { define } from 'typeorm-seeding';
import { Game } from '../../game/entities/game.entity';

var faker = require('faker');

define(Game, () => {
  const game = new Game();
  game.updatedAt = faker.time.recent() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365);
  game.createdAt = game.updatedAt - (1000 * 60 * Math.round(Math.random() * 10));
  return game;
});
