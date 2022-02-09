import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Participant } from '../../chat/entities/participant.entity';
import { Events } from '../../chat/gateways/chat.gateway';
import { ChatGatewayService } from '../../chat/gateways/chatGateway.service';
import { UserDto } from '../dtos/user.dto';
import { UserPhoto } from '../entities/users_photo.entity';

@EventSubscriber()
export class UserPhotoSubscriber
  implements EntitySubscriberInterface<UserPhoto>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return UserPhoto;
  }

  async manageWsEvent(event: InsertEvent<UserPhoto> | UpdateEvent<UserPhoto>) {
    await this.utils
      .fetchPossiblyMissingData(
        event.connection.getRepository(UserPhoto),
        event.entity,
        [
          'owner',
          'owner.local_photo',
          'owner.room_participations',
          'owner.room_participations.room',
        ],
      )
      .then(() => {
        const roomParticipations = event.entity.owner
          .room_participations as Participant[];
        if (roomParticipations.length) {
          const dest = roomParticipations.map((part) => part.room);
          this.chatGateway.sendEventToRoom(
            dest,
            Events.PUBLIC_USER_INFOS_UPDATED,
            plainToClass(UserDto, event.entity.owner, {
              excludeExtraneousValues: true,
            }),
          );
        }
      });
  }

  async afterUpdate(event: UpdateEvent<UserPhoto>) {
    await this.manageWsEvent(event).catch((e) =>
      new Logger('UserPhotoSubscriber').debug(e)
    );
  }
}
