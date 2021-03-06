import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { RoomBanGuard } from '../../guards/roomBan.guard';
import { RoomModeratorGuard } from '../../guards/roomModerator.guard';
import { RoomMuteGuard } from '../../guards/roomMute.guard';
import { RoomOwnerGuard } from '../../guards/roomOwner.guard';
import { RoomParticipantGuard } from '../../guards/roomParticipant.guard';
import { SiteOwnerGuard } from '../../guards/siteOwner.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { ChatService } from './chat.service';
import { TargetedRoom } from './decorators/targeted-room.decorator';
import { ChatMessageDto } from './dto/chatMessade.dto';
import { createMessageDto } from './dto/create-message.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateRestrictionDto } from './dto/create-restriction.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { ParticipantDto } from './dto/participant.dto';
import { RestrictionDto } from './dto/restriction.dto';
import { RoomDto, RoomWithRestrictionsDto } from './dto/room.dto';
import { UpdateIsPrivateDto } from './dto/update-isPrivate.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Room } from './entities/room.entity';

/*
  ===================================================================
  -------------------------------------------------------------------
        ROOM ROUTES
  -------------------------------------------------------------------
  ===================================================================
  */

@ApiTags('Chat')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
@UseGuards(AuthGuard)
@Controller('/room')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  /*
  ===================================================================
  -------------------------------------------------------------------
       Rooms Routes
  -------------------------------------------------------------------
  ===================================================================
  */

  @ApiOperation({
    summary: 'Create one room',
  })
  @ApiResponse({ type: RoomDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Newly create room infos',
  })
  @Post()
  @Serialize(RoomDto)
  async createRoom(@CurrentUser() user, @Body() createRoomDto: CreateRoomDto) {
    return await this.chatService
      .createRoom(user, createRoomDto)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  @ApiOperation({
    summary: 'Get all existing rooms',
  })
  @ApiResponse({ type: RoomWithRestrictionsDto, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Every rooms in the system',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User role is not high enough',
  })
  @Get('/all')
  @UseGuards(SiteOwnerGuard)
  @Serialize(RoomWithRestrictionsDto)
  async findAll() {
    return await this.chatService.findAllWithRestrictions().catch((error) => {
      this.logger.debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }

  @ApiOperation({
    summary: 'Get all public rooms',
  })
  @ApiResponse({ type: RoomDto, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Every public rooms, joined or not by the logged user',
  })
  @Get('/publics')
  @Serialize(RoomDto)
  async findAllPublic() {
    return await this.chatService.findAllPublic().catch((error) => {
      this.logger.debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }

  @ApiOperation({
    summary: 'Get a single rooms informations',
  })
  @ApiResponse({ type: RoomDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Single room informations',
  })
  @UseGuards(RoomParticipantGuard)
  @Get(':room_id/infos')
  @Serialize(RoomWithRestrictionsDto)
  async getSingleRoom(@TargetedRoom() targetedRoom: Room) {
    return targetedRoom;
  }

  @ApiOperation({
    summary: 'Delete one room if user is the owner or site owner',
  })
  @ApiResponse({ type: RoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Infos of the deleted room',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Delete(':room_id/remove')
  @Serialize(RoomDto)
  @UseGuards(RoomOwnerGuard)
  async remove(@TargetedRoom() targetedRoom: Room) {
    return await this.chatService.removeRoom(targetedRoom).catch((error) => {
      this.logger.debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES ROUTES
  -------------------------------------------------------------------
  ===================================================================
  */

  @ApiOperation({
    summary: 'Add a message to a room if user is participant',
  })
  @ApiResponse({ type: ChatMessageDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message was posted',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Post(':room_id/message')
  @Serialize(ChatMessageDto)
  @UseGuards(RoomBanGuard)
  @UseGuards(RoomMuteGuard)
  @UseGuards(RoomParticipantGuard)
  async addMessage(
    @TargetedRoom() room: Room,
    @CurrentUser() user: User,
    @Body() body: createMessageDto,
  ) {
    return await this.chatService
      .createMessage(room, user, body)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  @ApiOperation({
    summary: 'Get all messages of a room if user is participant',
  })
  @ApiResponse({ type: ChatMessageDto, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'messages array',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Get(':room_id/message')
  @Serialize(ChatMessageDto)
  @UseGuards(RoomParticipantGuard)
  async getMessages(@Param('room_id', ParseUUIDPipe) room_id: string) {
    return await this.chatService.findAllMessages(room_id).catch((error) => {
      this.logger.debug(error);
      if (error.status) throw new HttpException(error, error.status);
      throw new BadGatewayException('Database could not perform request');
    });
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        MODERATION ROUTES
  -------------------------------------------------------------------
  ===================================================================
  */

  @ApiOperation({
    summary: 'Add one participant to an existing room',
  })
  @ApiResponse({ type: ParticipantDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Post(':room_id/participant')
  @Serialize(ParticipantDto)
  @UseGuards(RoomModeratorGuard)
  async addParticipant(
    @TargetedRoom() room: Room,
    @Body() createPaticipant: CreateParticipantDto,
  ) {
    return await this.chatService
      .addParticipant(room, createPaticipant)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  @ApiOperation({
    summary: 'Change participant status into moderator',
  })
  @ApiResponse({ type: ParticipantDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Infos of the deleted room',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Patch(':room_id/moderator')
  @Serialize(ParticipantDto)
  @UseGuards(RoomOwnerGuard)
  async addModerator(@Body() updateDto: UpdateParticipantDto) {
    return await this.chatService
      .updateParticipant(updateDto)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  @ApiOperation({
    summary: 'Restriction a user from a room for a given time',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restriction was created',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Post(':room_id/restriction')
  @Serialize(RestrictionDto)
  @UseGuards(RoomModeratorGuard)
  async addRestriction(
    @TargetedRoom() room: Room,
    @Body() createRestrictionDto: CreateRestrictionDto,
  ) {
    return await this.chatService
      .createRestriction(room, createRestrictionDto)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  /*
    ===================================================================
    -------------------------------------------------------------------
    OWNER ROUTES
    -------------------------------------------------------------------
    ===================================================================
    */

  @ApiOperation({
    summary: "Update a owned room's password",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Patch(':room_id/password')
  @Serialize(RoomDto)
  @UseGuards(RoomOwnerGuard)
  async updatePassword(
    @TargetedRoom() room: Room,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.chatService
      .updatePassword(room, updatePasswordDto)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }

  @ApiOperation({
    summary: "Update a owned room's private status",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Private status updated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Patch(':room_id/privateStatus')
  @Serialize(RoomDto)
  @UseGuards(RoomOwnerGuard)
  async updatePrivateStatus(
    @TargetedRoom() room: Room,
    @Body() updateIsPrivateDto: UpdateIsPrivateDto,
  ) {
    return await this.chatService
      .updatePrivateStatus(room, updateIsPrivateDto)
      .catch((error) => {
        this.logger.debug(error);
        if (error.status) throw new HttpException(error, error.status);
        throw new BadGatewayException('Database could not perform request');
      });
  }
}
