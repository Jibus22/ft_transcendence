import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { Participant } from '../entities/participant.entity';

@EventSubscriber()
export class ParticipantSubscriber
  implements EntitySubscriberInterface<Participant>
{
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Participant;
  }
}
