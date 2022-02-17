import { UsersService } from 'src/modules/users/service-users/users.service';
import { Server } from 'socket.io';
import { User } from 'src/modules/users/entities/users.entity';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { randomUUID } from 'crypto';

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
    for (let count = 10; count > 0; count--) {
      server.to(room).emit('countDown', count);
      if (!count) {
        server.to(ch_id).emit('setMap', async (map: string) => {
          this.gameService.updateGame(room, { map: map, watch: randomUUID() });
        });
        server.to(room).emit('startGame', room);
      }
      await this.sleep(1000);
    }
    server.except(room).emit('newOnlineGame', { test: 'test' });

    ///// TEST // TODO: delete test below
    console.log(
      'countdown finished, game: ',
      await this.gameService.findOne(room),
    );
  }

  async createGame(
    [challenger, opponent]: User[],
    [ch_id, op_id]: string[],
    server: Server,
  ) {
    this.logger.log('createGame');
    const game_uuid = await this.gameService.newGame(challenger, opponent);

    server.in([ch_id, op_id]).socketsJoin(game_uuid);
    this.countdown(server, ch_id, game_uuid);
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
