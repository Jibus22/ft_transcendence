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
import { Restriction } from './restriction.entity';
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

  @OneToMany((type) => Restriction, (restrictions) => restrictions.room)
  restrictions: Restriction[];

  @OneToMany((type) => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

}
