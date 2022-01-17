import {
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  Column,
  BeforeInsert,
} from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  @BeforeInsert()
  updateDate() {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
