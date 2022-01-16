import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, runSeeder, Seeder } from 'typeorm-seeding';
import { Participant } from '../modules/chat/entities/participant.entity';
import { Room } from '../modules/chat/entities/room.entity';
import { UserDto } from '../modules/users/dtos/user.dto';
import { User } from '../modules/users/entities/users.entity';
import CreateRandomChatMessages from './create-random-chatMessages.seed';
import CreateRandomUsers from './create-random-users.seed';

export default class CreateRandomRooms implements Seeder {
  private logUserAsDto(key, value) {
    if (key === 'user') {
      return plainToClass(UserDto, value, { excludeExtraneousValues: true });
    } else {
      return value;
    }
  }

  private setParticipantsUser(allUsers: User[], participants: Participant[]) {
    let usersBase = [...allUsers];
    participants.forEach((participant) => {
      const index = Math.floor(Math.random() * usersBase.length);
      participant.user = usersBase.at(index);
      usersBase.splice(index, 1);
    });
  }

  private setRoomOwner(participants: Participant[]) {
    const index = Math.floor(Math.random() * participants.length);
    participants[index].is_moderator = true;
    participants[index].is_owner = true;
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    let allUsers = await connection.getRepository(User).find();
    const participantsRange = 12;
    while (allUsers.length < participantsRange) {
      console.log(' [ 🍃 More random users needed: seeding them now.]');
      await runSeeder(CreateRandomUsers);
      allUsers = await connection.getRepository(User).find();
    }

    await factory(Room)()
      .map(async (room: Room) => {
        let participants = await factory(Participant)().makeMany(
          Math.ceil(Math.random() * participantsRange - 2) + 2,
        );
        this.setRoomOwner(participants);
        this.setParticipantsUser(allUsers, participants);
        for (let i = 0; i < participants.length; i++) {
          participants[i] = await factory(Participant)().create(
            participants[i],
          );
        }
        room.participants = participants;
        console.log(JSON.stringify(room, this.logUserAsDto, 4));
        return room;
      })
      .createMany(20);

    await runSeeder(CreateRandomChatMessages);
  }
}
