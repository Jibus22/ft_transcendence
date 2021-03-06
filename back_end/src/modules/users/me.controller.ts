import {
  BadGatewayException, BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus, Logger, Patch,
  Res,
  Session,
  UseGuards
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { RoomBanGuard } from '../../guards/roomBan.guard';
import { RoomParticipantGuard } from '../../guards/roomParticipant.guard';
import { RoomPublicGuard } from '../../guards/roomPublic.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { AppUtilsService } from '../../utils/app-utils.service';
import { ChatService } from '../chat/chat.service';
import { TargetedRoom } from '../chat/decorators/targeted-room.decorator';
import { RoomDto, RoomWithMessagesDto } from '../chat/dto/room.dto';
import { roomPasswordDto } from '../chat/dto/roomPassword.dto';
import { Room } from '../chat/entities/room.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateLoginDto } from './dtos/update-profile.dto';
import { User } from './entities/users.entity';
import { UsersService } from './service-users/users.service';

@ApiTags('Me')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
@Controller('me')
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) {}

  /*
    ===================================================================
    -------------------------------------------------------------------
          USERS INFOS
    -------------------------------------------------------------------
    ===================================================================
    */

  @Get('/')
  @UseGuards(AuthGuard)
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Get infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User private informations',
  })
  async whoAmI(@CurrentUser() user: User) {
    await this.usersService.whoAmI(user);
    return user;
  }

  @Patch('/')
  @UseGuards(AuthGuard)
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User private informations updated',
  })
  async update(@Body() body: UpdateLoginDto, @CurrentUser() user: User) {
    return this.usersService.update(user.id, body).catch((error) => {
      const message = error.message as string;
      if (message?.includes('UNIQUE') || message?.includes('unique')) {
        throw new BadRequestException('already used');
      } else {
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');      }
    });
  }

  @Get('/is-logged')
  @ApiOperation({
    summary: 'Get authentication status of current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'User is logged with OAuth and header Completed-Auth is set according to 2FA status',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not logged with OAuth',
  })
  async isLogged(
    @CurrentUser() user: User,
    @Session() session,
    @Res() res: Response,
  ) {
    if (user.useTwoFA) {
      return res.set('Completed-Auth', session?.isTwoFAutanticated).send();
    }
    return res.set('Completed-Auth', 'true').send();
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        CHAT ROOM
  -------------------------------------------------------------------
  ===================================================================
  */

  @Get('/rooms')
  @UseGuards(AuthGuard)
  @Serialize(RoomWithMessagesDto)
  @ApiOperation({
    summary:
      'Get rooms in which the currently logged user is owner/moderator/participant',
  })
  @ApiResponse({ type: RoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'rooms in which the currently logged user is owner/moderator/participant',
  })
  async getMyRooms(@CurrentUser() user: User) {
    return await this.chatService.findUserRoomListWithMessages(user);
  }

  @Patch('/rooms/:room_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoomPublicGuard)
  @UseGuards(RoomBanGuard)
  @ApiOperation({
    summary: 'Join a public room with or without password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'successfully joined',
  })
  async joinRoom(
    @CurrentUser() user: User,
    @TargetedRoom() room: Room,
    @Body() body: roomPasswordDto,
  ) {
    await this.chatService.joinRoom(user, room, body).catch((error) => {
      new Logger('JoinRoomRoute').debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }

  @Delete('/rooms/:room_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoomParticipantGuard)
  @ApiOperation({
    summary: 'Leave a joined room',
  })
  @ApiResponse({ type: RoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'room was left',
  })
  async leaveRoom(@CurrentUser() user: User, @TargetedRoom() room: Room) {
    await this.chatService.leaveRoom(user, room).catch((error) => {
      new Logger('LeaveRoomRoute').debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }
}
