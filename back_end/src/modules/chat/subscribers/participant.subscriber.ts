import { plainToClass } from 'class-transformer';
import { eventNames } from 'process';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { RoomDto } from '../dto/room.dto';
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
    if (!event.entity?.room || !event.entity?.room?.participants)
      neededRelations.push('room');
    if (!event.entity?.user) neededRelations.push('user');
    console.log(neededRelations, 'are needed');

    if (neededRelations.length) {
      if (neededRelations.some((r) => r === 'room'))
        neededRelations.push('room.participants');
      await event.connection
        .getRepository(Participant)
        .findOne(event.entity.id, { relations: neededRelations })
        .then((participant) => {
          neededRelations.forEach((relation) => {
            if (relation === 'room.participants') {
              event.entity.room.participants = participant.room.participants;
            } else {
              event.entity[relation] = participant[relation];
            }
          });
        });
    }
  }

  async afterInsert(event: InsertEvent<Participant>) {
    await this.fetchPossiblyMissingData(event);

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
    await this.fetchPossiblyMissingData(event);
    console.log(event.entity);

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
