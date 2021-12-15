import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinTable,
  ManyToMany, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { UserDto } from '../dtos/user.dto';
import { UserPhoto } from './users_photo.entity';

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

  @Column()
  use_local_photo: boolean;

  @OneToOne(() => UserPhoto, photo => photo.owner)
  local_photo: UserPhoto;

  @ManyToMany(type => User, (user) => user.friends_list)
  @JoinTable()
  friends_list: UserDto[];

  @ManyToMany(type => User, (user) => user.blocked_list)
  @JoinTable()
  blocked_list: UserDto[];

  @Column({ nullable: true })
  twoFASecret: string

  @Column({ default: false })
  useTwoFA: boolean

  @Column({ nullable: true, unique: true })
  ws_id: string;

  @Column({ default: false })
  is_in_game: boolean

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
