import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  login_42: string;

  @Column()
  photo_url_42: string;

  @Column({
    unique: true,
    nullable: true,
  })
  photo_url_local: string;

  @Column()
  use_local_photo: boolean;

  // @Column({ nullable: true })
  @ManyToOne(type => User)
  @JoinTable({ name: "cat_id" })
  friends: User[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User: ', this);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User: ', this);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User: ', this);
  }
}
