import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Game } from '../modules/game/entities/game.entity';
import { Player } from '../modules/game/entities/player.entity';
import { UserDto } from '../modules/users/dtos/user.dto';
import { User } from '../modules/users/entities/users.entity';

export default class CreateRandomGames implements Seeder {
  private setScores(game: Game) {
    game.players[0].score = Math.ceil(Math.random() * (10 - 1) + 1);
    game.players[1].score = Math.ceil(Math.random() * (10 - 1) + 1);
    if (game.players[0].score === game.players[1].score) {
      let offset = -1;
      if (game.players[0].score === 0) {
        offset = +1;
      }
      game.players[Math.random() > 0.5 ? 0 : 1].score += offset;
    }
  }

  private setPlayersUser(allUsers: User[], game: Game, players: Player[]) {
    game.players = players;
    const p1Index = Math.floor(Math.random() * allUsers.length);
    let p2Index = Math.floor(Math.random() * allUsers.length);
    if (p1Index === p2Index) {
      p2Index -= 1;
    }
    game.players[0].user = allUsers.at(p1Index);
    game.players[1].user = allUsers.at(p2Index);
  }

  private logUserAsDto(key, value) {
    if (key === 'user') {
      return plainToClass(UserDto, value, { excludeExtraneousValues: true });
    } else {
      return value;
    }
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const allUsers = await connection.getRepository(User).find();

    await factory(Game)()
      .map(async (game: Game) => {

        let players = await factory(Player)()
          .makeMany(2);

        this.setPlayersUser(allUsers, game, players);
        this.setScores(game);

        players[0] = await factory(Player)().create(players[0]);
        players[1] = await factory(Player)().create(players[1]);
        game.players = players;
        console.log(JSON.stringify(game, this.logUserAsDto, 4));
        return game;
      })
      .createMany(50);
  }
}
