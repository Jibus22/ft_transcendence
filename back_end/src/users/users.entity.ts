import {
  AfterRemove,
  AfterUpdate,
  AfterInsert,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Timestamp,
  BeforeInsert,
  Unique,
} from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({unique: true})
  login: string;

  @Column({unique: true})
  login_42: string;

  @Column()
  photo_url_42: string;

  @Column({
    unique: true,
    nullable: true})
	photo_url_local: string;

  @Column()
	use_local_photo: boolean;


  @AfterInsert()
  logInsert() {
    console.log('Inserted User: ', this);
  }
  // @AfterRemove()
  // logRemove() {
  //   console.log('Removed User: ', this.id);
  // }
  @AfterUpdate()
  logUpdate() {
    console.log('Updated User: ', this);
  }
}
