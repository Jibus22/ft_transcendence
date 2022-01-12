import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Game } from './game.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'boolean', default: false })
  isWinner: boolean;

  @ManyToOne(() => User, (user) => user.players)
  user: User;

  @ManyToOne(() => Game, (game) => game.players)
  game: Game;
}
