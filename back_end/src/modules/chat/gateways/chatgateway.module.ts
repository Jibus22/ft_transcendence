/*
https://docs.nestjs.com/modules
*/

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { ChatGateway, GameGateway } from './chat.gateway';
import { ChatGatewayService } from './chatGateway.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [
    GameGateway,
    ChatGateway,
    ChatGatewayService,
    UsersService,
    AppUtilsService,
  ],
  exports: [ChatGatewayService],
})
export class ChatGatewayModule {}
