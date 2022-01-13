import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { ParticipantDto } from '../dto/participant.dto';
import { RoomDto } from '../dto/room.dto';
import { Participant } from '../entities/participant.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Participant;
  }

  private emitEvents(
    eventToRoom: string,
    eventToClient: string,
    entity: Participant,
  ) {
    this.chatGateway.sendEventToRoom(
      entity.room,
      eventToRoom,
      plainToClass(ParticipantDto, entity.user, {
        excludeExtraneousValues: true,
      }),
    );
    this.chatGateway.sendEventToClient(
      entity.user,
      eventToClient,
      plainToClass(RoomDto, entity.room, {
        excludeExtraneousValues: true,
      }),
    );
  }

  afterInsert(event: InsertEvent<Participant>) {
    if (event.entity?.room && event.entity?.user) {
      this.emitEvents('participantJoined', 'userAdded', event.entity);
      this.chatGateway.makeClientJoinRoom(event.entity.user, event.entity.room);
    } else {
      console.log('Subscriber missing entity properties!');
    }
  }

  beforeRemove(event: RemoveEvent<Participant>) {
    if (event.entity?.room && event.entity?.user) {
      this.chatGateway.makeClientLeaveRoom(
        event.entity.user,
        event.entity.room,
      );
      this.emitEvents('participantLeft', 'userRemoved', event.entity);
    } else {
      console.log('Subscriber missing entity properties!');
    }
  }
}
