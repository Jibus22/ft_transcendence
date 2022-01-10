import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Room } from './room.entity';

const conf = new ConfigService();

@Entity()
export class ChatMessage {
  /*
   ** Data
   */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => User, (user) => user.id)
  sender: User;

  @ManyToOne((type) => Room, { onDelete: 'CASCADE' })
  room: Room;

  @Column()
  timestamp: number;

  @Column()
  body: string;

  // @ManyToOne(type => Game, (game) => game.id)
  // @Column()
  // game: Game;

}
