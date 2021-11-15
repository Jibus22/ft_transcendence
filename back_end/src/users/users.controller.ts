import {
  Body, Controller, Delete, Get,
  Patch, Post, Query, Res, Session, UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './service_friends/friends.service';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDto } from '../users/dtos/update-users.dto';
import { UsersService } from '../users/service_users/users.service';
import { AuthService } from './service_auth/auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import { Serialize } from './interceptors/serialize.interceptor';
import { AddFriendDto } from './dtos/add-friend.dto';

@ApiTags('Users')
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private friendsService: FriendsService,
    private authService: AuthService,
    private configService: ConfigService) {}

    @Get('/callback')
    @ApiOperation({
      summary: 'Callback url for the 42 OAuth API'
    })
    async authCallback(@Query() query: {code: string, state: string},
    @Res() res , @Session() session: any) {

      const user = await this.authService.registerUser(query.code, query.state);
      session.userId = user.id;
      return res.redirect(this.configService.get('AUTH_REDIRECT_URL'));
    }

    @Delete('/signout')
    @ApiOperation({
      summary: 'Remove userId from user\'s session cookie'
    })
    signOut(@Session() session: any) {
      session.userId = null;
    }

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
      return await this.friendsService.getAllFriends(session.userId.id);
    }

    @Post('/friends')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Add one friend to the currently logger user'
    })
    @ApiCookieAuth()
    async addFriend(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.addFriend(session.userId.id, friendId.id);
    }

    @Delete('/friends')
    @UseGuards(AuthGuard)
    @ApiOperation({
      summary: 'Remove one friend to the currently logger user'
    })
    @ApiCookieAuth()
    async removeFriend(@Body() friendId: AddFriendDto, @Session() session) {
      return await this.friendsService.removeFriend(session.userId.id, friendId.id);
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
