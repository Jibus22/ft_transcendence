import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
import { fstat, unlink } from 'fs';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity, JoinColumn, JoinTable,
  ManyToMany, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { UserDto } from '../dtos/user.dto';
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
      // TODO : rm file in filesystem
      // unlink()
      console.log('🚮  Hook | Removed UserPhoto: ', this);
    }
  }

  @AfterUpdate()
  logUpdate() {
    if (conf.get('NODE_ENV') === 'dev') {
      console.log('Hook | Updated UserPhoto: ', this);
    }
  }
}
