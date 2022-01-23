import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Restriction } from '../entities/restriction.entity';
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
  // await this.utils.fetchPossiblyMissingData(
  //   event.connection.getRepository(Restriction),
  //   event.entity,
  //   ['user'],
  // );
}
