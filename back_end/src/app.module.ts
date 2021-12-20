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
import { ChatModule } from './chat/chat.module';
import { Room } from './chat/entities/room.entity';
import { DevelopmentModule } from './dev/development.module';
import { StatusGateway } from './status.gateway';
import { User } from './users/entities/users.entity';
import { UserPhoto } from './users/entities/users_photo.entity';
import { UsersModule } from './users/users.module';
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
      entities: [User, UserPhoto, Room],
      synchronize: true,
    }),
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
