import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user1) => user1.games)
  player1: User;

  @ManyToOne(() => User, (user2) => user2.games)
  player2: User;

  @Column({ type: 'int', default: 0 })
  scoreP1: number;

  @Column({ type: 'int', default: 0 })
  scoreP2: number;

  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;
}
