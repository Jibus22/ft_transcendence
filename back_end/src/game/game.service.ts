import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
  constructor(@InjectRepository(Game) private repository: Repository<Game>) {}

  async create(createGameDto: CreateGameDto) {
    const game = this.repository.create({
      uuidP1: createGameDto.uuidP1,
      uuidP2: createGameDto.uuidP2,
    });
    // console.log('This action adds a new game ', game);
    return await this.repository.save(game);
  }

  async findAll() {
    // console.log(`This action returns all games`);
    const games = await this.repository.find({});
    if (!games) {
      throw new NotFoundException('games not found');
    }
    return games;
  }

  async findOne(uuid: string) {
    // console.log(`This action returns a #${uuid} game`);
    const game = await this.repository.findOne(uuid);
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

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
