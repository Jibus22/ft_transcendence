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
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { ChatGatewayModule } from './modules/chat/gateways/chatgateway.module';
import { TargetedRoomMiddleware } from './modules/chat/middleware/targeted-room.middleware';
import { DatabaseModule } from './modules/database/database.module';
import { DevelopmentModule } from './modules/dev/development.module';
import { GameModule } from './modules/game/game.module';
import { CurrentUserMiddleware } from './modules/users/middleware/current-user.middleware';
import { AuthService } from './modules/users/service-auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { AppUtilsModule } from './utils/app-utils.module';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    AppUtilsModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    DevelopmentModule.forRoot(),
    HttpModule,
    ChatModule,
    UsersModule,
    GameModule,
    ChatGatewayModule,
  ],
  controllers: [AppController],
  providers: [
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
      .forRoutes('/room/:room_id/*', '/me/rooms/:room_id*');
  }
}
