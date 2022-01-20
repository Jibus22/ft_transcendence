import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Participant } from '../../chat/entities/participant.entity';
import { ChatGateway, Events } from '../../chat/gateways/chat.gateway';
import { User } from '../entities/users.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  private async fetchPossiblyMissingData(event: UpdateEvent<User>) {
    let neededRelations: string[] = [];
    if (!event.entity?.local_photo) neededRelations.push('local_photo');
    if (!event.entity?.room_participations) {
      neededRelations.push('room_participations');
      neededRelations.push('room_participations.room');
    }

    if (neededRelations.length) {
      await event.connection
        .getRepository(User)
        .findOne(event.entity.id, { relations: neededRelations })
        .then((participant) => {
          neededRelations.forEach((relation) => {
            event.entity[relation] = participant[relation];
          });
        });
    }
  }

  private isValidForEventEmit(event: UpdateEvent<User>) {
    const before: User = event.databaseEntity;
    const after: User = event.entity as User;
    return (
      before.room_participations.length &&
      (before.login !== after.login ||
        before.local_photo?.id !== after.local_photo?.id)
    );
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    await this.fetchPossiblyMissingData(event);

    if (this.isValidForEventEmit(event)) {
      const roomParticipations = event.databaseEntity
        .room_participations as Participant[];
      const dest = roomParticipations.map((part) => part.room);
      this.chatGateway.sendEventToRoom(dest, Events.ROOM_PARTICIPANTS_UPDATED, {
        id: event.entity.id,
      });
    }
  }
}
