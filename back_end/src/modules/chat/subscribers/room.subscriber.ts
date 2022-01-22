import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Room } from '../entities/room.entity';
import { ChatGateway, Events } from '../gateways/chat.gateway';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGateway,
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
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_CREATED, {
        id: event.entity.id,
      });
    }
  }

  async afterUpdate(event: UpdateEvent<Room>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Room),
      event.entity,
      ['participants'],
    );

    if (event.databaseEntity.is_private === false) {
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_UPDATED, {
        id: event.entity.id,
      });
    }
  }

  async beforeRemove(event: RemoveEvent<Room>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(Room),
      event.entity,
      ['participants'],
    );

    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_REMOVED, {
        id: event.entity.id,
      });
    }
  }
}
