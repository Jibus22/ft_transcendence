import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { HistoryGameDto, RegularPlayerDto } from './dto/history-game.dto';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/service-users/users.service';
import { User } from '../users/entities/users.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private game_repo: Repository<Game>,
    @InjectRepository(Player) private player_repo: Repository<Player>,
    private userService: UsersService,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const user1 = await this.userService.findOne(createGameDto.uuidP1);
    const user2 = await this.userService.findOne(createGameDto.uuidP2);

    if (!user1 || !user2) return null;

    const game = this.game_repo.create();
    await this.game_repo.save(game);
    const player1 = this.player_repo.create({ user: user1, game: game });
    const player2 = this.player_repo.create({ user: user2, game: game });
    await this.player_repo.save([player1, player2]);
    game.players = [player1, player2];
    await this.game_repo.save(game);
    return game;
  }

  async findAll() {
    const game = await this.game_repo.find();
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //returns a specific game according to its uuid
  async findOne(uuid: string) {
    const game = await this.game_repo.findOne(uuid);
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //update score of a game targeted by its uuid
  async update(uuid: string, updateGameDto: UpdateGameDto) {
    await this.game_repo.update(uuid, {
      // scoreP1: updateGameDto.scoreP1,
      // scoreP2: updateGameDto.scoreP2,
    });
    return await this.findOne(uuid);
  }

  async remove(uuid: string) {
    const game = await this.findOne(uuid);
    return await this.game_repo.remove(game);
  }

  private async getHistoryDto(game: Game) {
    const usr1 = await this.player_repo.findOne(game.players[0].id, {
      relations: ['user'],
    });
    const usr2 = await this.player_repo.findOne(game.players[1].id, {
      relations: ['user'],
    });
    const regplayer1 = new RegularPlayerDto(
      usr1.user.id,
      usr1.user.login,
      usr1.user.photo_url_42,
      game.players[0].score,
    );
    const regplayer2 = new RegularPlayerDto(
      usr2.user.id,
      usr2.user.login,
      usr2.user.photo_url_42,
      game.players[1].score,
    );
    const current_game = new HistoryGameDto(
      [regplayer1, regplayer2],
      game.createdAt,
      0,
    );
    return current_game;
  }

  async history() {
    let history: HistoryGameDto[] = [];
    const games = await this.game_repo.find({ relations: ['players'] });

    for (let i = 0; i < games.length; i++) {
      history.push(await this.getHistoryDto(games[i]));
    }

    return history;
  }
}
