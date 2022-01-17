import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Player]), UsersModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [TypeOrmModule],
})
export class GameModule {}
