import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
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

  @OneToMany((type) => Participant, (participant) => participant.room)
  participants: Participant[];

  @Column({ nullable: true })
  password: string;

  @Column()
  is_private: boolean;

  @ManyToOne((type) => ChatMessage, (message) => message.id)
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
