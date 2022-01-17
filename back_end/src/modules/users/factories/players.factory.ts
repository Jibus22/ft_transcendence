import { define } from 'typeorm-seeding';
import { Player } from '../../game/entities/player.entity';

define(Player, () => {
  return new Player();
});
