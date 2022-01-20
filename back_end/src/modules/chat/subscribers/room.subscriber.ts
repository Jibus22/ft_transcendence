import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
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

  private async fetchPossiblyMissingData(
    event: InsertEvent<Room> | UpdateEvent<Room> | RemoveEvent<Room>,
  ) {
    let neededRelations: string[] = [];
    if (!event.entity?.participants) neededRelations.push('participants');

    if (neededRelations.length) {
      await event.connection
        .getRepository(Room)
        .findOne(event.entity.id, { relations: neededRelations })
        .then((participant) => {
          neededRelations.forEach((relation) => {
            event.entity[relation] = participant[relation];
          });
        });
    }
  }

  async afterInsert(event: InsertEvent<Room>) {
    await this.fetchPossiblyMissingData(event);
    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_CREATED, {
        id: event.entity.id,
      });
    }
  }

  async afterUpdate(event: UpdateEvent<Room>) {
    await this.fetchPossiblyMissingData(event);
    if (event.databaseEntity.is_private === false) {
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_UPDATED, {
        id: event.entity.id,
      });
    }
  }

  async beforeRemove(event: RemoveEvent<Room>) {
    await this.fetchPossiblyMissingData(event);
    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(Events.PUBLIC_ROOM_REMOVED, {
        id: event.entity.id,
      });
    }
  }
}
