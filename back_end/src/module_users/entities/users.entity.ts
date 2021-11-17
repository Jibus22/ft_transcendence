import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {

  /*
  ** Data
  */

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

  @ManyToMany(type => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @ManyToMany(type => User, (user) => user.blockedAccounts)
  @JoinTable()
  blockedAccounts: User[];

  /*
  ** Lifecycle functions
  */

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
