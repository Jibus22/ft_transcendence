import { HttpModule } from '@nestjs/axios';
import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './modules/chat/chat.controller';
import { ChatModule } from './modules/chat/chat.module';
import { ChatMessage } from './modules/chat/entities/chatMessage.entity';
import { Participant } from './modules/chat/entities/participant.entity';
import { Restriction } from './modules/chat/entities/restriction.entity';
import { Room } from './modules/chat/entities/room.entity';
import { TargetedRoomMiddleware } from './modules/chat/middleware/targeted-room.middleware';
import { DevelopmentModule } from './modules/dev/development.module';
import { User } from './modules/users/entities/users.entity';
import { UserPhoto } from './modules/users/entities/users_photo.entity';
import { MeController } from './modules/users/me.controller';
import { CurrentUserMiddleware } from './modules/users/middleware/current-user.middleware';
import { AuthService } from './modules/users/service-auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { StatusGateway } from './status.gateway';

const cookieSession = require('cookie-session');

const ormSqliteConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DB_NAME,
  entities: [
    User,
    UserPhoto,
    Room,
    ChatMessage,
    Participant,
    ChatMessage,
    Restriction,
  ],
  synchronize: true,
};

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    process.env.NODE_ENV === 'test'
      ? TypeOrmModule.forRoot(ormSqliteConfig)
      : TypeOrmModule.forRoot(),
    HttpModule,
    ChatModule,
    UsersModule,
    DevelopmentModule,
  ],
  controllers: [AppController],
  providers: [
    StatusGateway,
    AuthService,
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
          sameSite: 'Lax',
        }),
      )
      .forRoutes('*');
    /*
     * The order of the MiddleWear is important for the TargetedRoom middlewear
     * to have access to the CurrentUser
     */
    consumer.apply(CurrentUserMiddleware).exclude('/dev/(.*)').forRoutes('*');
    consumer
      .apply(TargetedRoomMiddleware)
      .forRoutes(ChatController, MeController);
  }
}
