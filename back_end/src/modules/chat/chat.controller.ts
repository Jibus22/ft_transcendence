import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
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
import { RoomGuard } from '../../guards/room.guard';
import { RoomOwnerGuard } from '../../guards/roomOwner.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { ChatService } from './chat.service';
import { TargetedRoom } from './decorators/targeted-room.decorator';
import { ChatMessageDto } from './dto/chatMessade.dto';
import { createMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
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
  async create(@CurrentUser() user, @Body() createRoomDto: CreateRoomDto) {
    return await this.chatService.create(user, createRoomDto).catch((error) => {
      if (error.status) {
        throw new HttpException(error, error.status);
      } else {
        throw new BadRequestException(error);
      }
    });
  }

  @ApiOperation({
    summary: 'Get all existing rooms',
  })
  @ApiResponse({ type: RoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Every rooms in the system',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User must role is not high enough',
  })
  @Get('/all')
  // @UseGuards(SiteOwnerGuard) // TODO implement !!
  @Serialize(RoomDto)
  findAll() {
    return this.chatService.findAll();
  }

  @ApiOperation({
    summary: 'Get all public rooms',
  })
  @ApiResponse({ type: RoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Every public rooms, joined or not by the logged user',
  })
  @Get('/publics')
  @Serialize(RoomDto)
  findAllPublic() {
    return this.chatService.findAllPublic();
  }

  /*
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateRoomDto) {
    return this.chatService.update(+id, updateChatDto);
  }
*/

  @ApiOperation({
    summary: 'Delete one room if user is the owner or site owner',
  })
  @ApiResponse({ type: RoomDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Infos of the deleted room',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Delete(':room_id')
  @Serialize(RoomDto)
  @UseGuards(RoomOwnerGuard)
  async remove(@TargetedRoom() targetedRoom: Room) {
    return await this.chatService.remove(targetedRoom).catch((error) => {
      throw new NotFoundException(error);
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
  @ApiResponse({ type: RoomDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Infos of the deleted room',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Post(':room_id/message')
  @Serialize(ChatMessageDto)
  @UseGuards(RoomGuard)
  async addMessage(
    @TargetedRoom() room: Room,
    @CurrentUser() user: User,
    @Body() body: createMessageDto,
  ) {
    return await this.chatService.createMessage(room, user, body);
    // TODO here add websocket send function to all people in the room
  }

  @ApiOperation({
    summary: 'Add a message to a room if user is participant',
  })
  @ApiResponse({ type: RoomDto, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Infos of the deleted room',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'not enough rights',
  })
  @Get(':room_id/message')
  @Serialize(RoomDto)
  @UseGuards(RoomGuard)
  async getMessages(@Param('room_id') room_id: string) {
    return await this.chatService.findOneWithMessages(room_id);
  }
}
