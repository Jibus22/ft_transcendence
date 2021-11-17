import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AddFriendDto } from './dtos/add-friend.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import { Serialize } from './interceptors/serialize.interceptor';
import {
  RelationsService,
  RelationType,
} from './service_friends/relations.service';
import { UsersService } from './service_users/users.service';

@ApiTags('Users')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private friendsService: RelationsService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get every users in the database',
  })
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  /*****************************************************************************
   *    CURRENTLY LOGGED USER
   *****************************************************************************/

  @Get('/me')
  @ApiOperation({
    summary: 'Get infos of the currently logged user',
  })
  @ApiResponse({ type: UserDto })
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Patch('/me')
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: UserDto })
  async update(@Body() body: Partial<UpdateUserDto>, @Session() session: any) {
    return this.usersService.update(session.userId.id, body);
  }

  /*****************************************************************************
   *    FRIENDS
   *****************************************************************************/

  @Get('/friends')
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  async getAllFriends(@Session() session) {
    return await this.friendsService.getAllRelations(
      session.userId.id,
      RelationType.Friend,
    );
  }

  @Post('/friends')
  @ApiOperation({
    summary: 'Add one friend to the currently logger user',
  })
  async addFriend(@Body() friendId: AddFriendDto, @Session() session) {
    return await this.friendsService.addRelation(
      session.userId.id,
      friendId.id,
      RelationType.Friend,
    );
  }

  @Delete('/friends')
  @ApiOperation({
    summary: 'Remove one friend to the currently logger user',
  })
  async removeFriend(@Body() friendId: AddFriendDto, @Session() session) {
    return await this.friendsService.removeRelation(
      session.userId.id,
      friendId.id,
      RelationType.Friend,
    );
  }

  /*****************************************************************************
   *    BLOCKED ACCOUNTS
   *****************************************************************************/

  @Get('/block')
  @ApiOperation({
    summary: 'Get list of blocked accounts of the currently logger user',
  })
  async getAllBlocks(@Session() session) {
    return await this.friendsService.getAllRelations(
      session.userId.id,
      RelationType.Block,
    );
  }

  @Post('/block')
  @ApiOperation({
    summary: 'Add one blocked account to the currently logger user',
  })
  async addBlock(@Body() friendId: AddFriendDto, @Session() session) {
    return await this.friendsService.addRelation(
      session.userId.id,
      friendId.id,
      RelationType.Block,
    );
  }

  @Delete('/block')
  @ApiOperation({
    summary: 'Remove one blocked account to the currently logger user',
  })
  async removeBlock(@Body() friendId: AddFriendDto, @Session() session) {
    return await this.friendsService.removeRelation(
      session.userId.id,
      friendId.id,
      RelationType.Block,
    );
  }
}
