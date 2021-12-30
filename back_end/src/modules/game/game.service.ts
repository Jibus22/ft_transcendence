import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/service-users/users.service';
import { User } from '../users/entities/users.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private repository: Repository<Game>,
    private userService: UsersService,
  ) {}

  //Checks if uuid of players really exists & creates a new Game table, saves it
  //then update this table into the relationnal array of games from each players
  async create(createGameDto: CreateGameDto) {
    const p1 = await this.userService.findOne(createGameDto.uuidP1);
    const p2 = await this.userService.findOne(createGameDto.uuidP2);
    if (!p1 || !p2) {
      throw new NotFoundException('player not found');
    }
    const game = this.repository.create({
      player1: p1,
      player2: p2,
    });
    const saved_game = await this.repository.save(game);
    //TODO verifier si en rajoutant des games ça écrase pas les précédents
    // await this.userService.update(createGameDto.uuidP1, {
    //   games: [saved_game],
    // } as User);
    // await this.userService.update(createGameDto.uuidP2, {
    //   games: [saved_game],
    // } as User);
    return saved_game;
  }

  //returns all existing games
  async findAll() {
    const games = await this.repository.find({});
    if (!games) {
      throw new NotFoundException('games not found');
    }
    return games;
  }

  //returns a specific game according to its uuid
  async findOne(uuid: string) {
    const game = await this.repository.findOne(uuid);
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //update score of a game targeted by its uuid
  async update(uuid: string, updateGameDto: UpdateGameDto) {
    await this.repository.update(uuid, {
      scoreP1: updateGameDto.scoreP1,
      scoreP2: updateGameDto.scoreP2,
    });
    return await this.findOne(uuid);
  }

  async remove(uuid: string) {
    const game = await this.findOne(uuid);
    return await this.repository.remove(game);
  }
}
