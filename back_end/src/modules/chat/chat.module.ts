import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Room } from './entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatMessage } from './entities/chatMessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService, UsersService],
})
export class ChatModule {}
