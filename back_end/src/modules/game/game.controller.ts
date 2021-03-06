import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { UserDto } from '../users/dtos/user.dto';
import { User } from '../users/entities/users.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { HistoryGameDto } from './dto/history-game.dto';
import { LeaderBoardDto } from './dto/leaderboard.dto';
import { OnlineGameDto } from './dto/online-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './services/game.service';

@ApiTags('game')
@UseGuards(AuthGuard)
@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameGateway: GameGateway,
  ) {}

  private readonly logger = new Logger('GameController');

  @ApiResponse({ type: UserDto, isArray: false })
  @ApiOperation({ summary: 'challenge anyone' })
  @Serialize(UserDto)
  @Post()
  async gameInvitation(
    @CurrentUser() user: User,
    @Body() createGameDto: CreateGameDto,
  ) {
    this.logger.log('gameInvitation');
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
    this.logger.log('playnow');
    const ret: { game_id: string; joining: boolean } =
      await this.gameService.joinGame(user.id);
    return await this.gameGateway.joinGame(ret.game_id, ret.joining);
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
    const history = await this.gameService.history();
    return history.filter((elem: Game) => elem.players.length > 1);
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
