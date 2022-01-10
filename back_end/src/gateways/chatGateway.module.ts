import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../modules/chat/entities/chatMessage.entity';
import { Participant } from '../modules/chat/entities/participant.entity';
import { Restriction } from '../modules/chat/entities/restriction.entity';
import { Room } from '../modules/chat/entities/room.entity';
import { User } from '../modules/users/entities/users.entity';
import { UsersService } from '../modules/users/service-users/users.service';
import { ChatGateway } from './chat.gateway';
import { ChatGatewayService } from './chatGateway.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Room,
      User,
      ChatMessage,
      Participant,
      Restriction,
    ]),
  ],
  providers: [ChatGateway, ChatGatewayService, UsersService],
})
export class ChatGatewayModule {}
