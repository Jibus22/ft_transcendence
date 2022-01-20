import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ChatMessage } from '../entities/chatMessage.entity';
import { ChatGateway, Events } from '../gateways/chat.gateway';

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

  private async fetchPossiblyMissingData(
    event: InsertEvent<ChatMessage>,
  ) {
    let neededRelations: string[] = [];
    if (!event.entity?.room) neededRelations.push('room');
    if (!event.entity?.sender) neededRelations.push('sender');

    if (neededRelations.length) {
      await event.connection
        .getRepository(ChatMessage)
        .findOne(event.entity.id, { relations: neededRelations })
        .then((participant) => {
          neededRelations.forEach((relation) => {
            event.entity[relation] = participant[relation];
          });
        });
    }
  }

  async afterInsert(event: InsertEvent<ChatMessage>) {
    await this.fetchPossiblyMissingData(event);
    this.chatGateway.sendEventToRoom(
      event.entity.room,
      Events.NEW_MESSAGE,
      plainToClass(ChatMessageDto, event.entity, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
