import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Participant } from '../entities/participant.entity';
import { ChatGateway, Events } from '../gateways/chat.gateway';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly chatGateway: ChatGateway,
    private connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Participant;
  }

  private async fetchPossiblyMissingData(
    event: InsertEvent<Participant> | RemoveEvent<Participant>,
  ) {
    let neededRelations: string[] = [];
    if (!event.entity?.room) neededRelations.push('room');
    if (!event.entity?.user) neededRelations.push('user');

    if (neededRelations.length) {
      await event.connection
        .getRepository(Participant)
        .findOne(event.entity.id, { relations: neededRelations })
        .then((participant) => {
          neededRelations.forEach((relation) => {
            event.entity[relation] = participant[relation];
          });
        });
    }
  }

  async afterInsert(event: InsertEvent<Participant>) {
    await this.fetchPossiblyMissingData(event);

    this.chatGateway.sendEventToClient(event.entity.user, Events.USER_ADDED, {
      id: event.entity.room.id,
    });

    this.chatGateway.makeClientJoinRoom(event.entity.user, event.entity.room);

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      { id: event.entity.room.id },
    );
  }

  async beforeRemove(event: RemoveEvent<Participant>) {
    await this.fetchPossiblyMissingData(event);

    this.chatGateway.sendEventToClient(event.entity.user, Events.USER_REMOVED, {
      id: event.entity.room.id,
    });

    this.chatGateway.makeClientLeaveRoom(event.entity.user, event.entity.room);

    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.ROOM_PARTICIPANTS_UPDATED,
      { id: event.entity.room.id },
    );
  }
}
