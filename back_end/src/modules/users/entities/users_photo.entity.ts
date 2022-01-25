import { ConfigService } from '@nestjs/config';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';

const conf = new ConfigService();

@Entity()
export class UserPhoto {
  /*
   ** Data
   */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (owner) => owner.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @Column({ unique: true, nullable: false })
  fileName: string;
}
