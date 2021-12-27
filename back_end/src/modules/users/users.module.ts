import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from '../chat/chat.controller';
import { ChatModule } from '../chat/chat.module';
import { ChatService } from '../chat/chat.service';
import { Room } from '../chat/entities/room.entity';
import { CurrentRoomMiddleware } from '../chat/middleware/current-room.middleware';
import { AuthController } from './auth.controller';
import { User } from './entities/users.entity';
import { UserPhoto } from './entities/users_photo.entity';
import { MeController } from './me.controller';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { AuthService } from './service-auth/auth.service';
import { UsersPhotoService } from './service-file/userPhoto.service';
import { MeService } from './service-me/me.service';
import { RelationsService } from './service-relations/relations.service';
import { UsersService } from './service-users/users.service';
import { UsersController } from './users.controller';
import { UsersPhotoController } from './usersphoto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPhoto, Room]), HttpModule],
  providers: [
    UsersPhotoService,
    MeService,
    RelationsService,
    ConfigService,
    UsersService,
    AuthService,
    ChatService,
  ],
  controllers: [UsersController, UsersPhotoController, AuthController, MeController],
  exports: [UsersService]
})

export class UsersModule {
}
