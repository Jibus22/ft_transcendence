import { UsersService } from 'src/modules/users/service-users/users.service';
import { Server } from 'socket.io';
import { User } from 'src/modules/users/entities/users.entity';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { randomUUID } from 'crypto';
import { plainToClass } from 'class-transformer';
import { OnlineGameDto } from '../dto/online-game.dto';

@Injectable()
export class WsGameService {
  constructor(
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
  ) {}

  private readonly logger = new Logger('WsGameService');
  private readonly sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  private async countdown(server: Server, ch_id: string, room: string) {
    this.logger.log('countDown');

    for (let count = 10; count >= 0; count--) {
      server.to(room).emit('countDown', count);
      if (!count) {
        server.to(ch_id).emit('setMap', room);
        server.to(room).emit('startGame', room);
      }
      await this.sleep(1000);
    }
  }

  private async getOnlineGame(game_uuid: string) {
    const game = await this.gameService.findOne(game_uuid, {
      relations: ['players', 'players.user', 'players.user.local_photo'],
    });
    return plainToClass(OnlineGameDto, game, {
      excludeExtraneousValues: true,
    });
  }

  async startGame([ch_id, op_id]: string[], game_uuid: string, server: Server) {
    this.logger.log('startGame');
    server.in([ch_id, op_id]).socketsJoin(game_uuid);
    this.countdown(server, ch_id, game_uuid).then(async () => {
      const onlineGame = await this.getOnlineGame(game_uuid);
      server.except(game_uuid).emit('newOnlineGame', onlineGame);
    });
  }

  async createGame(
    [challenger, opponent]: User[],
    [ch_id, op_id]: string[],
    server: Server,
  ) {
    this.logger.log('createGame');
    const game_uuid = await this.gameService.newGame(challenger, opponent);
    this.startGame([ch_id, op_id], game_uuid, server);
  }

  async updatePlayerStatus(player: User, patch: { is_in_game: boolean }) {
    this.usersService.updateUser(player, patch);
  }

  async getUserFromParam(param: Partial<User>[]): Promise<User[]> {
    return await this.usersService.findOneWithAnyParam(param);
  }

  async cancelPanicGame(users: User[]) {
    for (let elem of users)
      if (elem) this.updatePlayerStatus(elem, { is_in_game: false });
  }
}
