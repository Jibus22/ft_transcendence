import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Room } from './entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User])],
  controllers: [ChatController],
  providers: [ChatService, UsersService],
})
export class ChatModule {}
