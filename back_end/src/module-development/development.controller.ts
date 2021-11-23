import {
  Body, Controller, Delete, Post, Session, UseGuards
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { deserialize, serialize } from 'class-transformer';
import { DevGuard } from '../guards/dev.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { User } from '../module-users/entities/users.entity';
import { DevelopmentService } from './development.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { devUserDto } from './dtos/devUser.dto';

@ApiTags('DevTools')
@Serialize(devUserDto)
@UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @ApiProperty()
  @Post('/signin')
  async logDebugUser(@Body() user: Partial<User>, @Session() session: any) {
    const newUser = await this.developmentService.dev_logUser(user.login);
    session.userId = newUser.id;
    return newUser;
  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: CreateUserDto[] | CreateUserDto,
    ) {
      let successCreation = 0;
      const users: Partial<User>[] = body as CreateUserDto[];
      for (const user of users) {
         await this.developmentService.dev_createUserBatch(user)
          .then((value) => { successCreation++; })
          .catch((err) => {});
      };
      return await this.developmentService.dev_getAllUser();
    }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
  ) {
    await this.developmentService.dev_deleteUserBatch(body);
  }

  @ApiProperty()
  @Delete('/deleteAllUsers')
  async deleteAllUsers() {
    await this.developmentService.dev_deleteAllUser();
  }
}
