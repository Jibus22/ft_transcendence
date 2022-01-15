import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';
import { ChatGateway } from '../gateways/chat.gateway';
import { Events } from '../gateways/chat.gateway';

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

    beforeRemove(event: RemoveEvent<Room>) {
      console.log('REMOVE ROOM', event.entity);

      if (event.entity.is_private === false) {
        console.log('REMOVE ROOM + EMIT EVENT');
        delete event.entity?.participants;
        delete event.entity?.restrictions;
        this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_REMOVED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }
}
