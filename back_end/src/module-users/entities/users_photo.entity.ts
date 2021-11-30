import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
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

  @Column()
  ownerId: string;


  @OneToOne(() => User, user => user.id)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  fileName: string;

// ----------------------

  /*
  ** Lifecycle functions
  */

  @AfterInsert()
  logInsert() {
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
