import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  imports: [TypeOrmModule.forFeature([User, UserPhoto]), HttpModule],
  providers: [
    UsersPhotoService,
    MeService,
    RelationsService,
    ConfigService,
    UsersService,
    AuthService
  ],
  controllers: [UsersController, UsersPhotoController, AuthController, MeController],
  exports: [UsersService]
})

export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude('/auth/*').forRoutes('*');
  }
}
