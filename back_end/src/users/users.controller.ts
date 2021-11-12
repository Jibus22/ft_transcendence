import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Patch,
  Param,
  Query,
  Session,
  NotFoundException,
  UseGuards,
  BadGatewayException,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { Serialize } from './interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/users.entity';
import { AuthGuard } from '../guards/auth.guard';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DebugGuard } from '../guards/debug.guard';
import { CreateUserDto } from './dtos/create-user.dto';

@ApiTags('Users')
@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(private authService: AuthService,
    private configService: ConfigService) {}

    @Post('/debug_signin')
    @UseGuards(DebugGuard)
    async logDebugUser(@Body() user: Partial<User>, @Session() session: any) {
      session.userId = await this.authService.debug_logUser(user.login);
      return user;
    }

    @ApiResponse({ type: UserDto })
    @Post('/debug_createUserBatch')
    @UseGuards(DebugGuard)
    async createUserBatch(@Body() body: CreateUserDto[] | CreateUserDto, @Session() session: any) {
      const users : Partial<User>[] = body as CreateUserDto[];
      return await this.authService.debug_createUserBatch(users);
    }

    @Delete('/debug_deleteUserBatch')
    @UseGuards(DebugGuard)
    async deleteUserBatch(@Body() body: {login: string}[], @Session() session: any) {
      await this.authService.debug_deleteUserBatch(body);
    }

    @Get('/callback')
    async authCallback(@Query() query, @Res() res, @Session() session: any) {

      const user = await this.authService.registerUser(query.code, query.state);
      session.userId = user.id;
      return res.redirect(this.configService.get('AUTH_REDIRECT_URL'));
    }

    @ApiResponse({ type: UserDto })
    @Get('/me')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
      return user;
    }

    @Post('/signout')
    signOut(@Session() session: any) {
      session.userId = null;
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
