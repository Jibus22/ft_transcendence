import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinTable,
  ManyToMany, PrimaryGeneratedColumn
} from 'typeorm';

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

  @ManyToMany(type => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @ManyToMany(type => User, (user) => user.blockedAccounts)
  @JoinTable()
  blockedAccounts: User[];

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
