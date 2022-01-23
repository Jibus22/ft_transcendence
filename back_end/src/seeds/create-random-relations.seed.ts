import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, runSeeder, Seeder } from 'typeorm-seeding';
import { Game } from '../modules/game/entities/game.entity';
import { Player } from '../modules/game/entities/player.entity';
import { UserDto } from '../modules/users/dtos/user.dto';
import { User } from '../modules/users/entities/users.entity';
import CreateRandomUsers from './create-random-users.seed';

export default class CreateRandomRelations implements Seeder {
  private logUserAsDto(key, value) {
    if (key === 'user') {
      return plainToClass(UserDto, value, { excludeExtraneousValues: true });
    } else {
      return value;
    }
  }

  private addRelations(user: User, allUsers: User[]) {

  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    // let allUsers = await connection.getRepository(User).find();
    // while (allUsers.length < 20) {
    //   console.log(' [ 🍃 More random users needed: seeding them now.]');
    //   await runSeeder(CreateRandomUsers);
    //   allUsers = await connection.getRepository(User).find();
    // }



  }
}
