import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Entity,
} from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  uuidP1: string;

  @Column({ type: 'uuid' })
  uuidP2: string;

  @Column({ type: 'int', default: 0 })
  scoreP1: number;

  @Column({ type: 'int', default: 0 })
  scoreP2: number;

  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;
}
