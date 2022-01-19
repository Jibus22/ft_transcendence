import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Restriction } from './entities/restriction.entity';
import { Room } from './entities/room.entity';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatGatewayService } from './gateways/chatGateway.service';
import { ChatMessageSubscriber } from './subscribers/chatMessage.subscriber';
import { ParticipantSubscriber } from './subscribers/participant.subscriber';
import { RestrictionSubscriber } from './subscribers/restriction.subscriber';
import { RoomSubscriber } from './subscribers/room.subscriber';
import { TaskerService } from './tasker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      User,
      ChatMessage,
      Participant,
      Restriction,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    UsersService,
    ChatService,
    TaskerService,
    RoomSubscriber,
    ChatMessageSubscriber,
    ParticipantSubscriber,
    RestrictionSubscriber,
    ChatGateway,
    ChatGatewayService,
  ],
  exports: [ChatService, TaskerService],
})
export class ChatModule {}
