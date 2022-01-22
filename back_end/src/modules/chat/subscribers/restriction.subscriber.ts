import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Restriction } from '../entities/restriction.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@EventSubscriber()
export class RestrictionSubscriber
  implements EntitySubscriberInterface<Restriction>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Restriction;
  }
  // await this.utils.fetchPossiblyMissingData(
  //   event.connection.getRepository(Restriction),
  //   event.entity,
  //   ['user'],
  // );
}
