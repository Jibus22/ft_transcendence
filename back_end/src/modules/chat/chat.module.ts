import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { Room } from './entities/room.entity';
import { CurrentRoomMiddleware } from './middleware/current-room.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {
}
