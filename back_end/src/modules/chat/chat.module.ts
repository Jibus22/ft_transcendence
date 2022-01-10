import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from '../../gateways/chat.gateway';
import { ChatGatewayModule } from '../../gateways/chatGateway.module';
import { ChatGatewayService } from '../../gateways/chatGateway.service';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Restriction } from './entities/restriction.entity';
import { Room } from './entities/room.entity';
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
    ChatGatewayService,
    UsersService,
    ChatService,
    TaskerService,
    RoomSubscriber,
    ChatMessageSubscriber,
    ParticipantSubscriber,
    RestrictionSubscriber,
  ],
  exports: [ChatService, TaskerService],
})
export class ChatModule {}
