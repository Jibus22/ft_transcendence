import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber
} from 'typeorm';
import { ChatGatewayService } from '../../../gateways/chatGateway.service';
import { Participant } from '../entities/participant.entity';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly chatGatewayService: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Participant;
  }
}
