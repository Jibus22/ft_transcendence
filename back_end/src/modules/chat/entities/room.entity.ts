import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatMessage } from './chatMessage.entity';
import { Participant } from './participant.entity';

const conf = new ConfigService();

@Entity()
export class Room {
  /*
   ** Data
   */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  is_private: boolean;

  @OneToMany((type) => Participant, (participant) => participant.room)
  participants: Participant[];

  @OneToMany((type) => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  /*
   ** Lifecycle functions
   */

  @AfterInsert()
  logInsert() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Inserted Room: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Removed Room: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Updated Room: ', this);
    }
  }
}
