import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ChatMessage } from '../entities/chatMessage.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@EventSubscriber()
export class ChatMessageSubscriber
  implements EntitySubscriberInterface<ChatMessage>
{
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return ChatMessage;
  }

  afterInsert(event: InsertEvent<ChatMessage>) {
    this.chatGateway.sendEventToRoom(
      event.entity.room,
      'newMessage',
      plainToClass(ChatMessageDto, event.entity, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
