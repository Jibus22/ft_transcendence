import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../modules/users/entities/users.entity';
import { Room } from './room.entity';

const conf = new ConfigService();

@Entity()
export class Participant {
  /*
   ** Data
   */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => User)
  user: User;

  @ManyToOne((type) => Room, { onDelete: 'CASCADE' })
  room: Room;

  @Column({ default: false })
  is_owner: boolean;

  @Column({ default: false })
  is_moderator: boolean;

  /*
   ** Lifecycle functions
   */

  @AfterInsert()
  logInsert() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Inserted Participant: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Removed Participant: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Updated Participant: ', this);
    }
  }
}
