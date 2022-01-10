import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
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
}
