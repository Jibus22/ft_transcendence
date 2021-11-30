import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinTable,
  ManyToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { UserDto } from '../dtos/user.dto';

const conf = new ConfigService;

@Entity()
export class User {

  /*
  ** Data
  */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

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

  @ManyToMany(type => User, (user) => user.friends_list)
  @JoinTable()
  friends_list: UserDto[];

  @ManyToMany(type => User, (user) => user.blocked_list)
  @JoinTable()
  blocked_list: UserDto[];

// ----------------------

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
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Inserted User: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Removed User: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Updated User: ', this);
    }
  }
}
