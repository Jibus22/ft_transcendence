import { ConfigService } from '@nestjs/config';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../modules/users/entities/users.entity';
import { Room } from './room.entity';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => User)
  user: User;

  @ManyToOne((type) => Room, { onDelete: 'CASCADE' })
  room: Room;

  @Column({ default: false })
  is_owner: boolean;

  @Column({ default: false })
  is_moderator: boolean;
}
