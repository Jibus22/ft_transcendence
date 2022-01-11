import { ConfigService } from '@nestjs/config';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Room } from './room.entity';

const conf = new ConfigService();

@Entity()
export class Restriction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => User)
  user: User;

  @ManyToOne((type) => Room, { onDelete: 'CASCADE' })
  room: Room;

  @Column()
  restriction_type: 'ban' | 'mute';

  @Column()
  expiration_time: number;

}
