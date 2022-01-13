import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber
} from 'typeorm';
import { ChatGatewayService } from '../gateways/chatGateway.service';
import { Restriction } from '../entities/restriction.entity';

@EventSubscriber()
export class RestrictionSubscriber
  implements EntitySubscriberInterface<Restriction>
{
  constructor(
    private readonly chatGatewayService: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Restriction;
  }
}
