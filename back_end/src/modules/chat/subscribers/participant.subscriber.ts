import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { RoomDto } from '../dto/room.dto';
import { Participant } from '../entities/participant.entity';
import { Events } from '../gateways/chat.gateway';
import { ChatGatewayService } from '../gateways/chatGateway.service';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
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
      ['room', 'room.participants', 'room.participants.user', 'user'],
    );

    this.chatGateway.sendEventToClient(
      event.entity.user,
      Events.USER_ADDED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );

    await this.chatGateway.makeClientJoinRoom(
      event.entity.user,
      event.entity.room,
    );
  }

  private isValidForEventEmit(event: UpdateEvent<Participant>) {
    return event.updatedColumns.some(
      (update) => update.propertyName === 'is_moderator',
    );
  }

  async afterUpdate(event: UpdateEvent<Participant>) {
    if (this.isValidForEventEmit(event)) {
      await this.utils.fetchPossiblyMissingData(
        event.connection.getRepository(Participant),
        event.entity,
        ['room', 'room.participants', 'room.participants.user', 'user'],
      );

      this.chatGateway.sendEventToClient(
        event.entity.user,
        Events.USER_MODERATION,
        plainToClass(RoomDto, event.entity.room, {
          excludeExtraneousValues: true,
        }),
      );
    }
  }

  async beforeRemove(event: RemoveEvent<Participant>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Participant),
      event.entity,
      ['room', 'room.participants', 'room.participants.user', 'user'],
    );

    this.chatGateway.sendEventToClient(
      event.entity.user,
      Events.USER_REMOVED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );

    await this.chatGateway.makeClientLeaveRoom(
      event.entity.user,
      event.entity.room,
    );
  }

  async afterRemove(event: RemoveEvent<Participant>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Participant),
      event.entity,
      ['room', 'room.participants', 'room.participants.user', 'user'],
    );

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      plainToClass(RoomDto, event.entity.room, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
