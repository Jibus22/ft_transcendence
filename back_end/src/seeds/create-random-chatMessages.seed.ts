import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { ChatMessage } from '../modules/chat/entities/chatMessage.entity';
import { Room } from '../modules/chat/entities/room.entity';
import { UserDto } from '../modules/users/dtos/user.dto';
import { User } from '../modules/users/entities/users.entity';

export default class CreateRandomChatMessages implements Seeder {
  private logCleaner(key, value) {
    if (key === 'user') {
      return plainToClass(UserDto, value, { excludeExtraneousValues: true });
    } else if (key === 'timestamp') {
      return new Date(value).toString();
    } else {
      return value;
    }
  }

  private setRoom(message: ChatMessage, allRooms: Room[]) {
    const index = Math.floor(Math.random() * allRooms.length);
    message.room = allRooms[index];
  }

  private setSender(message: ChatMessage, allUsers: User[]) {
    const index = Math.floor(Math.random() * allUsers.length);
    message.sender = allUsers[index];
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const allUsers = await connection.getRepository(User).find();
    const allRooms = await connection.getRepository(Room).find();

    return await factory(ChatMessage)()
      .map(async (message: ChatMessage) => {
        this.setSender(message, allUsers);
        this.setRoom(message, allRooms);
        console.log(JSON.stringify(message, this.logCleaner, 4));
        return message;
      })
      .createMany(200);
  }
}
