import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { RoomDto } from '../dto/room.dto';
import { Restriction } from '../entities/restriction.entity';
import { Events } from '../gateways/chat.gateway';
import { ChatGatewayService } from '../gateways/chatGateway.service';

@EventSubscriber()
export class RestrictionSubscriber
  implements EntitySubscriberInterface<Restriction>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Restriction;
  }

  async afterInsert(event: InsertEvent<Restriction>) {
    if (event.entity.restriction_type === 'ban') {
      await this.utils.fetchPossiblyMissingData(
        event.connection.getRepository(Restriction),
        event.entity,
        ['room', 'room.participants', 'user'],
      );

      this.chatGateway.sendEventToClient(
        event.entity.user,
        Events.USER_BANNED,
        plainToClass(RoomDto, event.entity.room, {
          excludeExtraneousValues: true,
        }),
      );
    }
  }
}
