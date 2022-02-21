import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './services/game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { HistoryGameDto } from './dto/history-game.dto';
import { LeaderBoardDto } from './dto/leaderboard.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../users/dtos/user.dto';
import { GameGateway } from './game.gateway';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { OnlineGameDto } from './dto/online-game.dto';
import { Game } from './entities/game.entity';

@ApiTags('game')
@UseGuards(AuthGuard)
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
  async gameInvitation(
    @CurrentUser() user: User,
    @Body() createGameDto: CreateGameDto,
  ) {
    const opponent = await this.gameService.gameInvitation(
      createGameDto.login_opponent,
      user,
    );
    this.gameGateway.gameInvitation(user, opponent);
    return opponent;
  }

  @ApiResponse({ type: UserDto, isArray: false })
  @ApiOperation({ summary: 'join a random game' })
  @Post('join')
  async playnow(@CurrentUser() user: User) {
    const ret: { game_id: string; joining: boolean } =
      await this.gameService.joinGame(user.id);
    return await this.gameGateway.joinGame(ret.game_id, ret.joining);
  }

  /// ---------------- TEST --------------------
  @Post('test')
  test(@CurrentUser() user: User) {
    console.log('TEST route');
    this.gameGateway.serverToClient(user.game_ws, 'This is a test from SERVER');
  }
  /// ---------------- TEST END ----------------

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

  @ApiResponse({ type: OnlineGameDto, isArray: true })
  @Serialize(OnlineGameDto)
  @Get('onlineGames')
  @ApiOperation({ summary: 'get a list of OnlineGameDto' })
  async onlineGames() {
    const games = await this.gameService.history();
    return games.filter((elem: Game) => elem.watch);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'returns a "uuid" game' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.gameService.findOne(uuid, null);
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
