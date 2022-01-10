import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { ChatGatewayService } from '../../../gateways/chatGateway.service';
import { Room } from '../entities/room.entity';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    // private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Room;
  }

  beforeInsert?(event: InsertEvent<Room>): Promise<any> | void {
  }

  afterInsert?(event: InsertEvent<Room>): Promise<any> | void {
    console.log('LOG HERE');
    // this.chatGateway.broadcastEvent('eventTest', 'hello');
  }
}
