import {
  Body, Controller, Delete, Get, Patch, Post, Session, UseGuards
} from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AddFriendDto } from './dtos/add-friend.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import { Serialize } from './interceptors/serialize.interceptor';
import { RelationsService, RelationType } from './service_friends/relations.service';
import { UsersService } from './service_users/users.service';

@ApiTags('Users')
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private friendsService: RelationsService,
  ) {}

    @Get('/')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Get every users in the database'
    })
    @ApiCookieAuth()
    async getAllUsers() {
      return await this.usersService.getAllUsers();
    }

    @Get('/me')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Get infos of the currently logged user'
    })
    @ApiCookieAuth()
    @ApiResponse({ type: UserDto })
    whoAmI(@CurrentUser() user: User) {
      return user;
    }

    @Patch('/me')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Update infos of the currently logged user'
    })
    @ApiCookieAuth()
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ type: UserDto })
    async update(@Body() body: Partial<UpdateUserDto>, @Session() session: any) {
      return this.usersService.update(session.userId.id, body);
    }

    @Get('/friends')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Get list of friends of the currently logger user'
    })
    @ApiCookieAuth()
    async getAllFriends(@Session() session) {
      return await this.friendsService.getAllRelations(session.userId.id, RelationType.Friend );
    }

    @Post('/friends')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Add one friend to the currently logger user'
    })
    @ApiCookieAuth()
    async addFriend(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.addRelation(session.userId.id, friendId.id, RelationType.Friend);
    }

    @Delete('/friends')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Remove one friend to the currently logger user'
    })
    @ApiCookieAuth()
    async removeFriend(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.removeRelation(session.userId.id, friendId.id, RelationType.Friend);
    }

    @Get('/block')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Get list of blocked accounts of the currently logger user'
    })
    @ApiCookieAuth()
    async getAllBlocks(@Session() session) {
      return await this.friendsService.getAllRelations(session.userId.id, RelationType.Block);
    }

    @Post('/block')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Add one blocked account to the currently logger user'
    })
    @ApiCookieAuth()
    async addBlock(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.addRelation(session.userId.id, friendId.id, RelationType.Block);
    }

    @Delete('/block')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Remove one blocked account to the currently logger user'
    })
    @ApiCookieAuth()
    async removeBlock(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.removeRelation(session.userId.id, friendId.id, RelationType.Block);
    }








  // @ApiResponse({ type: UserDto })
  // @Post('/signup')
  // async createUser(@Body() body: CreateUserDto, @Session() session: any) {
  //   const user = await this.authService.signup(body.email, body.password);
  //   session.userId = user.id;
  //   return user;
  // }

  // @ApiResponse({type: UserDto})

  // @ApiResponse({ type: UserDto })
  // @Post('/signin')
  // async signin(@Body() body: CreateUserDto, @Session() session: any) {
  //   const user = await this.authService.signin(body.email, body.password);
  //   session.userId = user.id;
  //   return user;
  // }



  // @Get('/:id')
  // async findUser(@Param('id') id: string) {
  //   const user = await this.userService.findOne(id);
  //   if (!user) {
  //     throw new NotFoundException('user not found');
  //   }
  //   return user;
  // }

  // @Get()
  // findAllUsers(@Query('login_42') login_42: string) {
  //   return this.userService.find(login_42);
  // }

  // @Patch('/:id')
  // updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
  //   return this.userService.update(parseInt(id), body);
  // }
}
