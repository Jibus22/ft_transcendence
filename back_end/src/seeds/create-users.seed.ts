import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../modules/users/entities/users.entity';

export default class CreateSiteOwners implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    let owners = new Set<Partial<User>>();
    owners.add({
      login: 'bvalette',
      login_42: 'bvalette',
      is_site_owner: true,
    });
    if (process.env.EXTRA_OWNER && process.env.EXTRA_OWNER.length > 0) {
      owners.add({
        login: process.env.EXTRA_OWNER,
        login_42: process.env.EXTRA_OWNER,
        is_site_owner: true,
      });
    }

    if (owners.size) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(Array.from(owners))
        .orUpdate({
          conflict_target: ['login_42'],
          overwrite: ['is_site_owner'],
        })
        .execute();

      const ownersInDb = await connection
        .createQueryBuilder(User, 'user')
        .where('user.is_site_owner = true')
        .getRawMany();
      console.log(ownersInDb);
    }
  }
}
