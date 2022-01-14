import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { Restriction } from '../entities/restriction.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@EventSubscriber()
export class RestrictionSubscriber
  implements EntitySubscriberInterface<Restriction>
{
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Restriction;
  }
}
