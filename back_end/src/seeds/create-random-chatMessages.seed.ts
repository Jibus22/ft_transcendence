import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { ChatMessage } from '../modules/chat/entities/chatMessage.entity';
import { Participant } from '../modules/chat/entities/participant.entity';
import { Room } from '../modules/chat/entities/room.entity';
import { UserDto } from '../modules/users/dtos/user.dto';

export default class CreateRandomChatMessages implements Seeder {
  private logCleaner(key, value) {
    if (key === 'user') {
      return plainToClass(UserDto, value, { excludeExtraneousValues: true });
    } else if (key === 'timestamp') {
      return new Date(parseInt(value as unknown as string)).toString();
    } else {
      return value;
    }
  }

  private setRoom(message: ChatMessage, allRooms: Room[]) {
    const index = Math.floor(Math.random() * allRooms.length);
    message.room = allRooms[index];
  }

  private setSender(message: ChatMessage, allParticipants: Participant[]) {
    const roomParticipants = allParticipants.filter(
      (p) => p.room.id === message.room.id,
    );

    const index = Math.floor(Math.random() * roomParticipants.length);
    message.sender = roomParticipants[index].user;
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const allParticipants = await connection
      .getRepository(Participant)
      .find({ relations: ['room', 'user'] });
    const allRooms = await connection.getRepository(Room).find();

    if (allRooms.length > 10 && allParticipants.length > 10) {
      return await factory(ChatMessage)()
        .map(async (message: ChatMessage) => {
          this.setRoom(message, allRooms);
          this.setSender(message, allParticipants);
          console.log(JSON.stringify(message, this.logCleaner, 4));
          return message;
        })
        .createMany(20 * allRooms.length);
    } else {
      throw new Error(
        `🔴 🔴 🔴  Not enough rooms or participants: rooms (${allRooms.length}), partitipants(${allParticipants.length}), seed some before seeding messages`,
      );
    }
  }
}
