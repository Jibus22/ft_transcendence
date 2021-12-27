import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus, NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { RoomGuard } from '../../guards/room.guard';
import { RoomOwnerGuard } from '../../guards/roomOwner.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { ChatService } from './chat.service';
import { TargetedRoom } from './decorators/targeted-room.decorator';
import { createMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@ApiTags('Chat')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
@UseGuards(AuthGuard)
@Serialize(RoomDto)
@Controller('/room')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({
    summary: 'Create one room',
  })
  @ApiResponse({ type: Room, isArray: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Newly create room infos',
  })
  async create(@CurrentUser() user, @Body() createRoomDto: CreateRoomDto) {
    return await this.chatService.create(user, createRoomDto).catch((error) => {
      if (error.status) {
        throw new HttpException(error, error.status);
      } else {
        throw new BadRequestException(error);
      }
    });
  }

  @Get()
  // @UseGuards(SiteOwnerGuard) // TODO implement
  @ApiOperation({
    summary: 'Get all existing rooms',
  })
  @ApiResponse({ type: Room, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Every rooms in the system',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User must role is not high enough',
  })
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateRoomDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @UseGuards(RoomGuard)
  @Post(':room_id/message')
  addMessage(
    @Param('room_id') id: string,
    @CurrentUser() user: User,
    @Body() body: createMessageDto,
  ) {
  }

  @UseGuards(RoomOwnerGuard)
  @Delete(':room_id')
  async remove(@Param('room_id') id: string, @TargetedRoom() targetedRoom: Room) {
    console.log('DELETE FUNCITON', id, targetedRoom);
    return await this.chatService.remove(id).catch((error) => {
      throw new NotFoundException(error);
    });
  }
}
