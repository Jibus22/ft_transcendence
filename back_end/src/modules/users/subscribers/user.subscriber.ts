import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Participant } from '../../chat/entities/participant.entity';
import { Events } from '../../chat/gateways/chat.gateway';
import { ChatGatewayService } from '../../chat/gateways/chatGateway.service';
import { UserDto } from '../dtos/user.dto';
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
    const afterUpdate: User = event.entity as User;
    return (
      afterUpdate.room_participations.length &&
      event.updatedColumns.some(
        (update) =>
          update.propertyName === 'login' ||
          update.propertyName === 'ws_id' ||
//TODO add ingame status here          // update.propertyName === 'in_game' ||
          update.propertyName === 'use_local_photo',
      )
    );
  }

  async afterUpdate(event: UpdateEvent<User>) {
    await this.utils
      .fetchPossiblyMissingData(
        event.connection.getRepository(User),
        event.entity,
        ['room_participations', 'room_participations.room', 'local_photo'],
      )
      .then(() => {
        if (this.isValidForEventEmit(event)) {
          const roomParticipations = event.entity
            .room_participations as Participant[];
          const dest = roomParticipations.map((part) => part.room);
          this.chatGateway.sendEventToRoom(
            dest,
            Events.PUBLIC_USER_INFOS_UPDATED,
            plainToClass(UserDto, event.entity, {
              excludeExtraneousValues: true,
            }),
          );
        }
      })
      .catch((e) => console.log(e));
  }
}
