import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Room } from './room.entity';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => User, (user) => user.id)
  sender: User;

  @ManyToOne((type) => Room, { onDelete: 'CASCADE' })
  room: Room;

  @Column({type: 'bigint'})
  timestamp: number;

  @Column()
  body: string;
}
