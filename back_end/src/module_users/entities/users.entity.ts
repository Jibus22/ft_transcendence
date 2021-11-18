import { ConfigService } from '@nestjs/config';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinTable,
  ManyToMany, PrimaryGeneratedColumn
} from 'typeorm';

const conf = new ConfigService;

@Exclude()
@Entity()
export class User {

  /*
  ** Data
  */

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ unique: true })
  login: string;

  @Expose()
  @Column({ unique: true })
  login_42: string;

  @Column()
  photo_url_42: string;

  @Column({
    unique: true,
    nullable: true,
  })
  photo_url_local: string;

  @Column()
  use_local_photo: boolean;

  @Expose()
  @ManyToMany(type => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @Expose()
  @ManyToMany(type => User, (user) => user.blockedAccounts)
  @JoinTable()
  blockedAccounts: User[];

// ----------------------

	@Expose()
	@Transform(value => {
		if (value.obj.use_local_photo === false || value.obj.photo_url_local === null) {
			return value.obj.photo_url_42;
		}
		return value.obj.photo_url_local;
	})
	photo_url: string;

  /*
  ** Lifecycle functions
  */

  @AfterInsert()
  logInsert() {
    if (conf.get('NODE_ENV') !== 'production') {
      console.log('Inserted User: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') !== 'production') {
      console.log('Removed User: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') !== 'production') {
      console.log('Updated User: ', this);
    }
  }
}
