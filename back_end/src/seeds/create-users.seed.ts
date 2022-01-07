import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../modules/users/entities/users.entity';

export default class CreateSiteOwners implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const isDbSeedable =
      (await connection.query('SELECT * FROM USER WHERE is_site_owner = 1'))
        .length === 0;

    if (isDbSeedable) {
      const owners: Partial<User>[] = [
        {
          login: 'bvalette',
          login_42: 'bvalette',
          photo_url_42: '',
          is_site_owner: true,
        }
      ];

      if (process.env.EXTRA_OWNER.length > 0) {
        owners.push({
          login: process.env.EXTRA_OWNER,
          login_42: process.env.EXTRA_OWNER,
          photo_url_42: '',
          is_site_owner: true,
        })
      }

      await connection
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(owners)
        .execute();

        console.log(
          await connection.query('SELECT * FROM USER WHERE is_site_owner = 1'),
        );
    }
  }
}
