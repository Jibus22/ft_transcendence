import { Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { RoomOwnerGuard } from '../../guards/roomOwner.guard';
import { SiteOwnerGuard } from '../../guards/siteOwner.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { ChatService } from './chat.service';
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
  constructor(
    private readonly chatService: ChatService
    ) {}

    @Post()
    @ApiOperation({
      summary: 'Create one room',
    })
    @ApiResponse({ type: Room, isArray: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Newly create room infos' })
    async create(@CurrentUser() user, @Body() createRoomDto: CreateRoomDto) {
      return await this.chatService.create(user, createRoomDto)
      .catch((error) => {
        if (error.status) {
          throw new HttpException(error, error.status);
        }
        else {
          throw new InternalServerErrorException(error);
        }
      });
    }

  @Get()
  // @UseGuards(SiteOwnerGuard) // TODO implement
  @ApiOperation({
    summary: 'Get all existing rooms',
  })
  @ApiResponse({ type: Room, isArray: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Every rooms in the system' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User must role is not high enough' })
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateRoomDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Post(':room_id/message')
  addMessage(@Param('room_id') id: string, @CurrentUser() user: User, @Body() message: createMessageDto){

  }

  @UseGuards(RoomOwnerGuard) // TODO implement
  @Delete(':room_id')
  async remove(@Param('room_id') id: string) {
    console.log('DELETE FUNCITON');
    return await this.chatService.remove(id).catch((error) => {
      throw new NotFoundException(error);
    })
  }
}
