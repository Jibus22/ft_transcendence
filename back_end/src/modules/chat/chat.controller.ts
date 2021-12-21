import { Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { SiteOwnerGuard } from '../../guards/siteOwner.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { ChatService } from './chat.service';
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
    async create(@CurrentUser() user, @Body() createChatDto: CreateRoomDto) {
      return await this.chatService.create(user, createChatDto)
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
  @UseGuards(SiteOwnerGuard)
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
