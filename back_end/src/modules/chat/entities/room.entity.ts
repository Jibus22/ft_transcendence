import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, PrimaryGeneratedColumn
} from 'typeorm';


const conf = new ConfigService;

@Entity()
export class Room {

  /*
  ** Data
  */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(type => User, (owner) => owner.rooms_ownership)
  // owner: User;

  // @ManyToMany(type => User, (moderators) => moderators.rooms_moderation)
  // @JoinTable()
  // moderators: User[];

  @Column({ nullable: true })
  password: string;

  @Column()
  is_private: boolean;

  // @ManyToOne(type => ChatMessage, (chat) => user.id)
  // messages: ChatMessage

  // participants

  /*
  ** Lifecycle functions
  */

  @AfterInsert()
  logInsert() {
    // TODO: add owner to moderator list!
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Inserted User: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Removed User: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Updated User: ', this);
    }
  }
}
