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

  private async countDown(challenger_sock: any, room: string, server: Server) {
    this.logger.log('countDown');
    let count = 10;

    const idInterval = setInterval(() => {
      server.to(room).emit('countDown', count);
      count--;
      if (!count) {
        const start = Date.now();
        challenger_sock.emit('setMap', async (map: string) => {
          if (Date.now() - start > 3000) return; //TODO: conn issue: do something;
          this.gameService.updateGame(room, { map: map, watch: randomUUID() });
        });
        server.to(room).emit('startGame', room);
        clearInterval(idInterval);
      }
    }, 1000);

    ///// TEST
    await new Promise((resolve) => setTimeout(resolve, 12000));
    console.log(
      'countdown finished, game: ',
      await this.gameService.findOne(room),
    );
  }

  async createGame(
    challenger: User,
    opponent: User,
    challenger_sock: any,
    opponent_sock: any,
    server: Server,
  ) {
    this.logger.log('createGame');
    const game_uuid = await this.gameService.newGame(challenger, opponent);

    challenger_sock.join(game_uuid);
    opponent_sock.join(game_uuid);
    // server.to(game_uuid).emit('getRoom', game_uuid);
    this.countDown(challenger_sock, game_uuid, server);
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
