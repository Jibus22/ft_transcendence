import {
  AfterRemove,
  AfterUpdate,
  AfterInsert,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Report } from '../reports/reports.entity'

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({default: true})
  admin: boolean;

  @Column()
  password: string;

  @OneToMany( () => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User: ', this.id);
  }
  @AfterRemove()
  logRemove() {
    console.log('Removed User: ', this.id);
  }
  @AfterUpdate()
  logUpdate() {
    console.log('Updated User: ', this.id);
  }
}
