import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMessage } from './chatMessage.entity';
import { Participant } from './participant.entity';
import { Restriction } from './restriction.entity';

@Entity()
export class Room {
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
