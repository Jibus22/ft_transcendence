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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { Serialize } from './interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users.entity';
import { AuthGuard } from '../guards/auth.guard';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@ApiTags('Users')
@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(private authService: AuthService,
    private configService: ConfigService) {}

    @Get('/callback')
    async authCallback(@Query() query, @Res() res, @Session() session: any) {

      await this.authService.signinUser(query.code, query.state);
      // if ( ! user) {
      //   throw new BadGatewayException('could not log');
      // }
      return res.redirect(this.configService.get('AUTH_REDIRECT_URL'));
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

  // @ApiResponse({ type: UserDto })
  // @Get('/whoami')
  // @UseGuards(AuthGuard)
  // whoAmI(@CurrentUser() user: User) {
  //   return user;
  // }

  // @Post('/signout')
  // signOut(@Session() session: any) {
  //   session.userId = null;
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
