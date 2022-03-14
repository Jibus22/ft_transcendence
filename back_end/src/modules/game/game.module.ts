import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { UsersModule } from '../users/users.module';
import { GameGateway } from './game.gateway';
import { WsGameService } from './services/ws-game.service';
import { WsConnectionService } from './services/ws-connection.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Player]), UsersModule],
  controllers: [GameController],
  providers: [GameService, GameGateway, WsGameService, WsConnectionService],
  exports: [TypeOrmModule],
})
export class GameModule {}
