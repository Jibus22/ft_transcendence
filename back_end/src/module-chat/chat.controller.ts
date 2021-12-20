import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from 'src/module-users/dtos/user.dto';
import { ChatService } from './chat.service';
import { Room } from './entities/room.entity';

@ApiTags('Chat')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
@UseGuards(AuthGuard)
@Serialize(UserDto)
@Controller('/chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
  ) {}

	@Get('/')
  @ApiOperation({
    summary: 'Get every chatrooms in the database',
  })
  @ApiResponse({ type: Room, isArray: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rooms array' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No users' })
  async getAllChats() {
    return ;
  }


}
