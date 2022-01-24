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
import { Room } from '../entities/room.entity';
import { Events } from '../gateways/chat.gateway';
import { ChatGatewayService } from '../gateways/chatGateway.service';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Room;
  }

  async afterInsert(event: InsertEvent<Room>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Room),
      event.entity,
      ['participants'],
    );

    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_CREATED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }

  async afterUpdate(event: UpdateEvent<Room>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Room),
      event.entity,
      ['participants'],
    );

    if (event.databaseEntity.is_private === false) {
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_UPDATED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }

  async beforeRemove(event: RemoveEvent<Room>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Room),
      event.entity,
      ['participants'],
    );

    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(
        Events.PUBLIC_ROOM_REMOVED,
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }
}
