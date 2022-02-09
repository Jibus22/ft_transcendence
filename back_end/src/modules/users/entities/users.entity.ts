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
import { Player } from '../../game/entities/player.entity';
import { UserDto } from '../dtos/user.dto';
import { UserPhoto } from './users_photo.entity';

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

  @Column({ default: 'https://cdn.intra.42.fr/users/medium_default.png' })
  photo_url_42: string;

  @Column({ default: false })
  use_local_photo: boolean;

  @Column({ default: false })
  is_site_owner: boolean;

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

  @OneToMany(() => Player, (player) => player.user)
  players: Player[];

  @OneToMany(() => Participant, (participant) => participant.user)
  room_participations: Participant[];
}
