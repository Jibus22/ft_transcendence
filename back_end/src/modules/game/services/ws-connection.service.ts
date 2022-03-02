import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { User } from 'src/modules/users/entities/users.entity';
import { UpdateUserDto } from '../../users/dtos/update-users.dto';
import { UsersService } from '../../users/service-users/users.service';
import { ScoreDto } from '../dto/gameplay.dto';
import { myPtoOnlineGameDto, myPtoUserDto, sleep } from '../utils/utils';
import { GameService } from './game.service';
import { WsGameService } from './ws-game.service';

@Injectable()
export class WsConnectionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
    private readonly wsGameService: WsGameService,
  ) {}

  private readonly logger = new Logger('WsGameService');
    
  private async updateUser(client: Socket, userData: UpdateUserDto) {
    await this.usersService
      .find({ game_ws: client.id })
      .then(async (users) => {
        if (users[0]) {
          await this.usersService.update(users[0].id, userData);
        }
      })
      .catch((error) => {
        this.logger.debug(error.message);
        client._error({ message: error.message });
        return client.disconnect();
      });
  }

  private doHandleConnectionFailure(client: Socket, errorMessage: string) {
    this.logger.debug(
      `handleConnectionFAILURE: client ${client.id} disconnected !🛑  -> `,
      errorMessage,
    );
    client._error({ message: errorMessage });
    client.disconnect();
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
  }

  async doHandleConnection(client: Socket): Promise<void> {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token).catch((error) => {
      this.doHandleConnectionFailure(client, error.message);
    });

    if (!userId) {
      return this.doHandleConnectionFailure(client, 'invalid token');
    }
    this.logger.log(`handleConnection:\n${client.id} | token ${token}`);

    await this.usersService
      .update(userId, {
        game_ws: client.id,
        is_in_game: false,
      })
      .catch((error) => {
        this.doHandleConnectionFailure(client, error.message);
      });

    this.logger.log(`handleConnection: Client connected ! ✅`);
  }

  async handleGameDisconnection(server: Server, user: User) {
    const [game] = await this.gameService.findGameWithAnyParam(
      [{ id: user.players[user.players.length - 1].game.id }],
      { relations: ['players', 'players.user', 'players.user.local_photo'] },
    );
    server
      .to([game.id, game.watch])
      .emit('playerDisconnection', myPtoUserDto(user));
    for (let i = 8; i >= 0; i--) {
      await sleep(1000);
      [user] = await this.usersService.findOneWithAnyParam(
        [{ id: user.id }],
        null,
      );
      if (user.game_ws) {
        await this.usersService.updateUser(user, { is_in_game: true });
        server.to(user.game_ws).emit('goBackInGame', myPtoOnlineGameDto(game));
        server
          .to([game.id, game.watch])
          .except(user.game_ws)
          .emit('playerCameBack', myPtoUserDto(user));
        break;
      } else if (!user.game_ws && i == 0) {
        let score = new ScoreDto();
        if (game.players.length < 2) {
          this.gameService.remove(game.id);
          return;
        }
        score.score1 = game.players[0].score;
        score.score2 = game.players[1].score;
        if (game.players[0].user.id === user.id) score.score2 = 10;
        else score.score1 = 10;
        await this.gameService.updateScores(game.id, score);
        await this.wsGameService.updatePlayerStatus2(
          [game.players[0].user.id, game.players[1].user.id],
          { is_in_game: false },
        );
        server
          .to([game.id, game.watch])
          .emit('playerGiveUp', myPtoUserDto(user));
        server.socketsLeave([game.id, game.watch]);
      }
    }
  }

  async doHandleDisconnect(client: Socket, server: Server) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const [user] = await this.usersService.findOneWithAnyParam(
      [{ game_ws: client.id }],
      { relations: ['players', 'players.game'] },
    );

    if (user) {
      if (user.is_in_game) this.handleGameDisconnection(server, user);
    }
    await this.updateUser(client, {
      game_ws: null,
      is_in_game: false,
    });
  }
}
