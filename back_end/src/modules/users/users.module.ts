import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from '../chat/chat.service';
import { ChatMessage } from '../chat/entities/chatMessage.entity';
import { Participant } from '../chat/entities/participant.entity';
import { Restriction } from '../chat/entities/restriction.entity';
import { Room } from '../chat/entities/room.entity';
import { TaskerService } from '../chat/tasker.service';
import { AuthController } from './auth.controller';
import { User } from './entities/users.entity';
import { UserPhoto } from './entities/users_photo.entity';
import { MeController } from './me.controller';
import { AuthService } from './service-auth/auth.service';
import { UsersPhotoService } from './service-file/userPhoto.service';
import { MeService } from './service-me/me.service';
import { RelationsService } from './service-relations/relations.service';
import { UsersService } from './service-users/users.service';
import { UsersController } from './users.controller';
import { UsersPhotoController } from './usersphoto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPhoto,
      Room,
      Participant,
      ChatMessage,
      Restriction,
    ]),
    HttpModule,
  ],
  providers: [
    UsersPhotoService,
    MeService,
    RelationsService,
    ConfigService,
    UsersService,
    AuthService,
    ChatService,
    TaskerService,
  ],
  controllers: [
    UsersController,
    UsersPhotoController,
    AuthController,
    MeController,
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
