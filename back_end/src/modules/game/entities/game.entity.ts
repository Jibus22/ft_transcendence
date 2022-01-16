import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  Column,
} from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  @Column()
  // @CreateDateColumn()
  createdAt: number;

  @Column()
  // @UpdateDateColumn()
  updatedAt: number;
}
