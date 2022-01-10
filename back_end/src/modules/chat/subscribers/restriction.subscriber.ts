import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { Restriction } from '../entities/restriction.entity';

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
