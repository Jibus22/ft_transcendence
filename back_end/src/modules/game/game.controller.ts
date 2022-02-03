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
import { HistoryGameDto } from './dto/history-game.dto';
import { LeaderBoardDto } from './dto/leaderboard.dto';
import { NewGameDto } from './dto/new-game.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { GameGateway } from './game.gateway';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameGateway: GameGateway,
  ) {}

  @ApiResponse({ type: UserDto, isArray: false })
  @ApiOperation({ summary: 'challenge anyone' })
  @Serialize(UserDto)
  @Post()
  async gameInvitation(@Body() createGameDto: CreateGameDto) {
    const [challenger, opponent] = await this.gameService.gameInvitation(
      createGameDto,
    );
    setTimeout(this.gameGateway.gameInvitation, 0, challenger, opponent);
    return opponent;
  }

  @ApiResponse({ type: NewGameDto, isArray: false })
  @ApiOperation({ summary: 'join a random game' })
  @Serialize(NewGameDto)
  @Post('join')
  async playnow(@Body() createGameDto: CreateGameDto) {
    return await this.gameService.joinGame(createGameDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns all games' })
  async findAll() {
    return await this.gameService.findAll();
  }

  @ApiResponse({ type: HistoryGameDto, isArray: true })
  @Serialize(HistoryGameDto)
  @Get('history')
  @ApiOperation({ summary: 'get a list of all HistoryGameDto' })
  async history() {
    return await this.gameService.history();
  }

  @ApiResponse({ type: LeaderBoardDto, isArray: true })
  @Serialize(LeaderBoardDto)
  @Get('leaderboard')
  @ApiOperation({ summary: 'get a list of LeaderBoardDto' })
  async leaderboard() {
    return await this.gameService.leaderboard();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'returns a "uuid" game' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.gameService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'update a game "uuid"' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() patchedGame: UpdateGameDto,
  ) {
    return await this.gameService.updateGame(uuid, patchedGame);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'removes a "uuid" game' })
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.gameService.remove(uuid);
  }
}
