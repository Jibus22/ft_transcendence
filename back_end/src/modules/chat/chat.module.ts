import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Restriction } from './entities/restriction.entity';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      User,
      ChatMessage,
      Participant,
      ChatMessage,
      Restriction
    ]),
  ],
  controllers: [ChatController],
  providers: [UsersService, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
