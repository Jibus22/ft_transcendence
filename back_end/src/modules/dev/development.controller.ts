import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { DevGuard } from '../../guards/dev.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { privateUserDto } from '../users/dtos/private-user.dto';
import { UpdateUserDto } from '../users/dtos/update-users.dto';
import { UserDto } from '../users/dtos/user.dto';
import { User } from '../users/entities/users.entity';
import { DevelopmentService } from './development.service';

@ApiTags('DevTools')
@Serialize(privateUserDto)
// @UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @ApiProperty()
  @Post('/signin')
  async logDebugUser(@Body() user: { login: string }, @Session() session: any) {
    const newUser = await this.developmentService.dev_logUser(user.login);
    session.userId = newUser.id;
    session.useTwoFA = newUser.useTwoFA;
    session.isTwoFAutanticated = false;
    return newUser;
  }

  @ApiProperty()
  @Get('/users')
  async getAllUsers() {
    return this.developmentService.dev_getAllUsers();
  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(@Body() body: UpdateUserDto[] | UpdateUserDto) {
    // console.log('creatuserbatch', body);
    const users: Partial<User>[] = body as UpdateUserDto[];
    for (const user of users) {
      // console.log('creatuserbatch user', user);
      await this.developmentService.dev_createUserBatch(user).catch((err) => {
        // console.log(`createUserBatch: error: ${err}`);
      });
    }
    return await this.developmentService.dev_getAllUsers();
  }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(@Body() body: { login: string }[]) {
    await this.developmentService.dev_deleteUserBatch(body);
  }

  @ApiProperty()
  @Delete('/deleteAllUsers')
  async deleteAllUsers() {
    await this.developmentService.dev_deleteAllUser();
  }

  @Post('createRandomGames')
  async createRandomGames() {
    await this.developmentService.createRandomGames();
  }
}
