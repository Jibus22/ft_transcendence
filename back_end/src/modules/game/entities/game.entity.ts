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

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  @Column({ default: null })
  map: string;

  @Column({ default: null })
  watch: string;

  @BeforeInsert()
  updateDate() {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
