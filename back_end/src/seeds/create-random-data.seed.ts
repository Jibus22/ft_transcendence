import { Connection } from 'typeorm';
import { Factory, runSeeder, Seeder } from 'typeorm-seeding';
import CreateRandomGames from './create-random-games.seed';
import CreateRandomRooms from './create-random-rooms.seed';
import CreateRandomUsers from './create-random-users.seed';
import getAllData from './get-all-data.seed';

export default class CreateRandomData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    console.log('🌳 Seeding all random data...');
    await runSeeder(CreateRandomUsers);
    await runSeeder(CreateRandomRooms);
    await runSeeder(CreateRandomGames);
    await runSeeder(getAllData);
  }
}
