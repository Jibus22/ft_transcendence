import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Room } from '../modules/chat/entities/room.entity';
import { Game } from '../modules/game/entities/game.entity';
import { UserDto } from '../modules/users/dtos/user.dto';
import { User } from '../modules/users/entities/users.entity';

export default class getAllData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    console.log('🌳 All Data Seeded: ');

    const usersInDb = await connection
      .getRepository(User)
      .find({ relations: ['players'] });
    console.log(' 🧍‍♀️  Users in database now: ', usersInDb.length);
    usersInDb.forEach((u) => {
      let user = plainToClass(UserDto, u);
      console.log(
        `[${u.id}] - ${user.login} - is ${user.status} - has played ${u.players.length}`,
      );
    });

    const roomsInDb = await connection
      .getRepository(Room)
      .find({ relations: ['participants', 'participants.user', 'messages'] });
    console.log(' 🍄  Rooms in database now: ', roomsInDb.length);
    roomsInDb.forEach((r) => {
      console.log(
        `[${r.is_private ? 'private' : 'PUBLIC '}].[${r.id}] - with  ${
          r.participants.length
        }  participants and  ${
          r.messages.length.toString().padEnd(4, ' ')
        }  messages , owner is ${
          (r.participants.find(p => p.is_owner)).user.login
        } -- ${
          r.password ? 'protected with "password"' : ''
        }`);
        });

    const gamesInDb = await connection
      .getRepository(Game)
      .find({ relations: ['players', 'players.user'] });
    console.log(' ⛳️  Games in database now: ', gamesInDb.length);
    gamesInDb.forEach((g) => {
      console.log(
        `[${g.id}] - ${g.players[0].user.login} (${g.players[0].score}) // ${g.players[1].user.login} (${g.players[1].score})`,
      );
    });
  }
}
