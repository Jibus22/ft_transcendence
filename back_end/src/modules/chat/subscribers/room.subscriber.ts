import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';

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
    console.log(event.entity);
    if (event.entity.is_private === false) {
      this.chatGateway.broadcastEventToServer(
        'publicRoomCreated',
        JSON.stringify(
          plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
        ),
      );
    }
  }

  beforeRemove(event: RemoveEvent<Room>) {
    if (event.entity.is_private === false) {
      delete event.entity?.participants;
      delete event.entity?.restrictions;
      this.chatGateway.broadcastEventToServer(
        'publicRoomRemoved',
        JSON.stringify(
          plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
        ),
      );
    }
  }
}
