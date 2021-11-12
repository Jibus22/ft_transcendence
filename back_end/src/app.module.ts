import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config'
const cookieSession = require('cookie-session');

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { DevelopmentModule } from './development/development.module';
import { UsersService } from 'src/users/users.service';
import { DevelopmentService } from './development/development.service';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
      }),
      TypeOrmModule.forRoot(
        {
          type: 'sqlite',
          database: 'dbDev.sqlite',
          entities: [User],
          synchronize: true
        }),
        UsersModule,
        DevelopmentModule,
      ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true
      })
    }
  ],
})

export class AppModule {

  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      cookieSession(
        {
          keys: [this.configService.get('COOKIE_KEY')],
        })).forRoutes('*');
  }
}
