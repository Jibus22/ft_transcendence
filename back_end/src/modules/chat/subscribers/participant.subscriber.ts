import { plainToClass } from 'class-transformer';
import { eventNames } from 'process';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { RoomDto } from '../dto/room.dto';
import { Participant } from '../entities/participant.entity';
import { ChatGateway, Events } from '../gateways/chat.gateway';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGateway,
    private connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Participant;
  }

  async afterInsert(event: InsertEvent<Participant>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Participant),
      event.entity,
      ['room', 'room.participants', 'user'],
    );

    this.chatGateway.sendEventToClient(
      event.entity.user,
      Events.USER_ADDED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );

    this.chatGateway.makeClientJoinRoom(event.entity.user, event.entity.room);

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async beforeRemove(event: RemoveEvent<Participant>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Participant),
      event.entity,
      ['room', 'room.participants', 'user'],
    );

    this.chatGateway.sendEventToClient(
      event.entity.user,
      Events.USER_REMOVED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );

    this.chatGateway.makeClientLeaveRoom(event.entity.user, event.entity.room);

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
