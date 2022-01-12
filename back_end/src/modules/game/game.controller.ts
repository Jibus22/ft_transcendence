import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'adds a new game' })
  async create(@Body() createGameDto: CreateGameDto) {
    return await this.gameService.create(createGameDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all games' })
  async findAll() {
    return await this.gameService.findAll();
  }

  @Get('history')
  @ApiOperation({ summary: 'get a list of all HistoryGameDto' })
  async history() {
    return await this.gameService.history();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'returns a "uuid" game' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.gameService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'update a "uuid" game' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return await this.gameService.update(uuid, updateGameDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'removes a "uuid" game' })
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.gameService.remove(uuid);
  }
}
