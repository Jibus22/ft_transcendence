import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  ValidationPipe
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { ChatMessage } from './modules/chat/entities/chatMessage.entity';
import { Room } from './modules/chat/entities/room.entity';
import { DevelopmentModule } from './modules/dev/development.module';
import { User } from './modules/users/entities/users.entity';
import { UserPhoto } from './modules/users/entities/users_photo.entity';
import { UsersModule } from './modules/users/users.module';
import { StatusGateway } from './status.gateway';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_NAME,
      entities: [User, UserPhoto, Room, ChatMessage],
      synchronize: true,
    }),

    ChatModule,
    UsersModule,
    DevelopmentModule,
  ],
  controllers: [AppController],
  providers: [
    StatusGateway,
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
        }),
      )
      .forRoutes('*');
  }
}
