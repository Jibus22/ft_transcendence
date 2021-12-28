import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../../users/entities/users.entity';

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

  @Column()
  timestamp: string; //Date type ?

  @Column()
  body: string;

  // @ManyToOne(type => Game, (game) => game.id)
  // @Column()
  // game: Game;

  /*
   ** Lifecycle functions
   */

  @AfterInsert()
  logInsert() {
    // TODO: add owner to moderator list!
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Inserted ChatMessage: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Removed ChatMessage: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Updated ChatMessage: ', this);
    }
  }
}
