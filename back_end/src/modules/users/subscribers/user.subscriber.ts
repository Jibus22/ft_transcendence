import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber, UpdateEvent
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { RoomDto } from '../../chat/dto/room.dto';
import { Participant } from '../../chat/entities/participant.entity';
import { Events } from '../../chat/gateways/chat.gateway';
import { ChatGatewayService } from '../../chat/gateways/chatGateway.service';
import { User } from '../entities/users.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  private isValidForEventEmit(event: UpdateEvent<User>) {
    const before: User = event.databaseEntity;
    const after: User = event.entity as User;
    return (
      before?.room_participations?.length &&
      (before.login !== after.login ||
        before.local_photo?.id !== after.local_photo?.id)
    );
  }

  async afterUpdate(event: UpdateEvent<User>) {
    await this.utils
      .fetchPossiblyMissingData(
        event.connection.getRepository(User),
        event.entity,
        ['room_participations', 'room_participations.room'],
      )
      .then(() => {
        if (this.isValidForEventEmit(event)) {
          const roomParticipations = event.databaseEntity
            .room_participations as Participant[];
          const dest = roomParticipations.map((part) => part.room);
          this.chatGateway.sendEventToRoom(
            dest,
            Events.ROOM_PARTICIPANTS_UPDATED,
            plainToClass(RoomDto, event.entity.room, {
              excludeExtraneousValues: true,
            }),
          );
        }
      })
      .catch((e) => console.log(e));
  }
}
