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
import { DevelopmentModule } from './module-development/development.module';
import { User } from './module-users/entities/users.entity';
import { UserPhoto } from './module-users/entities/users_photo.entity';
import { UsersModule } from './module-users/users.module';
import { StatusGateway } from './status.gateway';
import { GameModule } from './game/game.module';
import { Game } from './game/entities/game.entity';
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
      entities: [User, UserPhoto, Game],
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
