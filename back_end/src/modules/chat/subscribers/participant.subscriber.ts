import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  TransactionCommitEvent,
  UpdateEvent,
} from 'typeorm';
import { RoomDto } from '../dto/room.dto';
import { Participant } from '../entities/participant.entity';
import { Room } from '../entities/room.entity';
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

  private emitEvents(
    eventToRoom: string,
    eventToClient: string,
    entity: Participant,
  ) {
    this.chatGateway.sendEventToRoom(
      entity.room,
      eventToRoom,
      plainToClass(RoomDto, entity.room, {
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

  async afterInsert(event: InsertEvent<Participant>) {
    const room = await this.connection.getRepository(Room).findOne(event.entity.room.id, {relations: ['participants']});
    console.log('Room in after indert', room);
    event.entity.room = room;
    if (event.entity?.room && event.entity?.user) {
      this.chatGateway.makeClientJoinRoom(event.entity.user, event.entity.room);
      this.emitEvents(
        Events.PARTICIPANT_UPDATED,
        Events.USER_ADDED,
        event.entity,
      );
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
      this.emitEvents(
        Events.PARTICIPANT_UPDATED,
        Events.USER_REMOVED,
        event.entity,
      );
    } else {
      console.log('Subscriber missing entity properties!'); // TODO fix
    }
  }
}
