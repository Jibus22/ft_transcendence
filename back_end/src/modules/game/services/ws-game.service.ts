import { Injectable, Logger } from '@nestjs/common';
import { myPtoOnlineGameDto, sleep } from '../utils/utils';
import { Server } from 'socket.io';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { GameService } from './game.service';

@Injectable()
export class WsGameService {
  constructor(
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
  ) {}

  private readonly logger = new Logger('WsGameService');

  private async countdown(server: Server, ch_id: string, room: string) {
    this.logger.log('countDown');

    for (let count = 3; count >= 0; count--) {
      server.to(room).emit('countDown', count);
      if (!count) {
        server.to(ch_id).emit('setMap', room);
        server.to(room).emit('startGame', room);
      }
      await sleep(1000);
    }
  }

  private async getOnlineGame(game_uuid: string) {
    const game = await this.gameService.findOne(game_uuid, {
      relations: ['players', 'players.user', 'players.user.local_photo'],
    });
    return myPtoOnlineGameDto(game);
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
    await this.usersService.updateUser(player, patch);
  }

  async updatePlayerStatus2(
    player_id: string[],
    patch: { is_in_game: boolean },
  ) {
    for (let elem of player_id) await this.usersService.update(elem, patch);
  }

  async getUserFromParam(
    param: Partial<User>[],
    relations: { relations: string[] },
  ): Promise<User[]> {
    return await this.usersService.findOneWithAnyParam(param, relations);
  }

  async cancelPanicGame(users: User[]) {
    for (let elem of users)
      if (elem) this.updatePlayerStatus(elem, { is_in_game: false });
  }
}
