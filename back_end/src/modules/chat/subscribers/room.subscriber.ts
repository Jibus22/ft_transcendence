import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';
import { ChatGateway, Events } from '../gateways/chat.gateway';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Room;
  }

  afterInsert(event: InsertEvent<Room>) {
    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_CREATED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }

  beforeUpdate(event: UpdateEvent<Room>) {
    if (event.databaseEntity.is_private === false) {
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_UPDATED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }

  beforeRemove(event: RemoveEvent<Room>) {
    if (event.entity.is_private === false) {
      delete event.entity?.participants;
      delete event.entity?.restrictions;
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_REMOVED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }
}
