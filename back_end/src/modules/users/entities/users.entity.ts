import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Participant } from '../../chat/entities/participant.entity';
import { UserDto } from '../dtos/user.dto';
import { UserPhoto } from './users_photo.entity';
import { Game } from '../../game/entities/game.entity';

const conf = new ConfigService();

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

  @OneToOne(() => UserPhoto, (photo) => photo.owner)
  local_photo: UserPhoto;

  @ManyToMany(() => User, (user) => user.friends_list)
  @JoinTable()
  friends_list: UserDto[];

  @ManyToMany(() => User, (user) => user.blocked_list)
  @JoinTable()
  blocked_list: UserDto[];

  @Column({ nullable: true })
  twoFASecret: string;

  @Column({ default: false })
  useTwoFA: boolean;

  @Column({ nullable: true, unique: true })
  ws_id: string;

  @Column({ default: false })
  is_in_game: boolean;

  @OneToMany(() => Game, (game) => game.player1)
  games: Game[];

  // @OneToMany(type => Room, (rooms_ownership) => rooms_ownership.id)
  // rooms_ownership: Room[];

  @OneToMany(() => Participant, (participant) => participant.user)
  room_participations: Participant[];

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
