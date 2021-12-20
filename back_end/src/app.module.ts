import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Room } from './modules/chat/entities/room.entity';
import { ChatModule } from './modules/chat/chat.module';
import { DevelopmentModule } from './modules/dev/development.module';
import { UserPhoto } from './modules/users/entities/users_photo.entity';
import { UsersModule } from './modules/users/users.module';
import { StatusGateway } from './status.gateway';
import { GameModule } from './modules/game/game.module';
import { Game } from './modules/game/entities/game.entity';
import { User } from './modules/users/entities/users.entity';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ChatModule,
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_NAME,
      entities: [User, UserPhoto, Game, Room],
      synchronize: true,
    }),
    UsersModule,
    DevelopmentModule,
    GameModule,
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
