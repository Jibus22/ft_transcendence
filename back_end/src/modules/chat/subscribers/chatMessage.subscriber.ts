import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ChatMessage } from '../entities/chatMessage.entity';
import { Events } from '../gateways/chat.gateway';
import { ChatGatewayService } from '../gateways/chatGateway.service';

@EventSubscriber()
export class ChatMessageSubscriber
  implements EntitySubscriberInterface<ChatMessage>
{
  constructor(
    private readonly utils: AppUtilsService,
    private readonly chatGateway: ChatGatewayService,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return ChatMessage;
  }

  async afterInsert(event: InsertEvent<ChatMessage>) {
    await this.utils.fetchPossiblyMissingData(
      event.connection.getRepository(ChatMessage),
      event.entity,
      ['room', 'sender'],
    );
    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.NEW_MESSAGE,
      plainToClass(ChatMessageDto, event.entity, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
