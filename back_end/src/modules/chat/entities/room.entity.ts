import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/users.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';


const conf = new ConfigService;

@Entity()
export class Room {

  /*
  ** Data
  */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => User, (owner) => owner.rooms_ownership)
  owner: User;

  @ManyToMany(type => User, (moderators) => moderators.rooms_moderation)
  @JoinTable()
  moderators: User[];

  @ManyToMany(type => User, (moderators) => moderators.rooms_joined)
  @JoinTable()
  participants: User[];

  //Will be salted and hashed
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
