import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Room } from './entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, ChatMessage, Participant])],
  controllers: [ChatController],
  providers: [UsersService, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
