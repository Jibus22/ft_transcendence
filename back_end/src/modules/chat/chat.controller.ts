import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { UserDto } from '../users/dtos/user.dto';
import { User } from '../users/entities/users.entity';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { Room } from './entities/room.entity';

@ApiTags('Chat')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
@UseGuards(AuthGuard)
@Serialize(UserDto)
@Controller('/room')
export class ChatController {
  constructor(
    private chatService: ChatService,
  ) {}

	@Post('/')
  @ApiOperation({
    summary: 'Create one room',
  })
  @ApiResponse({ type: Room, isArray: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Room infos' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No users' })
  async createOneRoom(@CurrentUser() user, @Body() roomData: CreateRoomDto) {
    console.log(roomData);
    return await this.chatService.create(user, roomData);
  }


}

/*

"create room"
"POST"
"/room"
"isPrivate, participants[], password?","room dto"

"delete room"
"DELETE"
"/room/:id"
"ok / unauthorised"

"create message"
"POST"
"/room/message"
"room_id, content","ok / unauthorised"

"load messages from room"
"GET"
"/room/:id"
":id","rooms infos + messages[]"

"load room list"
"GET"
"/me/rooms"
"rooms[]"


*/
