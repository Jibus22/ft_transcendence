import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../modules/users/entities/users.entity';

export default class CreateSiteOwners implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const isDbSeedable =
      (await connection.query('SELECT * FROM USER WHERE is_site_owner = 1')).length === 0;

      console.log((await connection.query('SELECT * FROM USER WHERE is_site_owner = 1')));
      console.log((await connection.query('SELECT * FROM USER')));
    if (isDbSeedable) {
      console.log('SEEDING !!!!!!!!');

      await connection
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          { login: 'bvalette', login_42: 'bvalette', photo_url_42: '', is_site_owner: true },
          { login: 'test2', login_42: 'test2', photo_url_42: '', is_site_owner: true },
        ])
        .execute();
    }
  }
}
