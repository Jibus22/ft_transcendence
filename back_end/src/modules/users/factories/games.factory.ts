import { define } from 'typeorm-seeding';
import { Game } from '../../game/entities/game.entity';

define(Game, () => {
    return new Game();
});
