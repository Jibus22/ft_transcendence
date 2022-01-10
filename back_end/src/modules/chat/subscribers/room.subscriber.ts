import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { Room } from '../entities/room.entity';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Room;
  }
}
