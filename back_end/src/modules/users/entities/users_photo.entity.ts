import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './users.entity';

const conf = new ConfigService;

@Entity()
export class UserPhoto {

  /*
  ** Data
  */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, owner => owner.id, {onDelete: 'CASCADE'})
  @JoinColumn()
  owner: User;

  @Column({ unique: true, nullable: false })
  fileName: string;

// ----------------------

  /*
  ** Lifecycle functions
  */

  @AfterInsert()
  logInsert() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Hook | Inserted UserPhoto: ', this);
    }
  }

  @AfterRemove()
  logRemove() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Hook | Removed UserPhoto: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Hook | Updated UserPhoto: ', this);
    }
  }
}
