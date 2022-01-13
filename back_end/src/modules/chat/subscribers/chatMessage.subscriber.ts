import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { ChatGateway } from '../../../gateways/chat.gateway';
import { ChatGatewayService } from '../../../gateways/chatGateway.service';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ChatMessage } from '../entities/chatMessage.entity';
@EventSubscriber()
export class ChatMessageSubscriber
  implements EntitySubscriberInterface<ChatMessage>
{
  constructor(
    private readonly chatGatewayService: ChatGatewayService,
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return ChatMessage;
  }

  afterInsert(event: InsertEvent<ChatMessage>) {
    this.chatGateway.broadcastEventToRoom(
      event.entity.room,
      'newMessage',
      JSON.stringify(
        plainToClass(ChatMessageDto, event.entity, {
          excludeExtraneousValues: true,
        }),
      ),
    );
  }
}
