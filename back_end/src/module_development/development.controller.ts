import {
  Body, Controller, Delete, Post, Session, UseGuards
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { DevGuard } from '../guards/dev.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { User } from '../module_users/entities/users.entity';
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
    session.userId = await this.developmentService.dev_logUser(user.login);
    return session.userId;
  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: CreateUserDto[] | CreateUserDto,
    @Session() session: any,
    ) {
      const users: Partial<User>[] = body as CreateUserDto[];
      return await this.developmentService.dev_createUserBatch(users);
    }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
    @Session() session: any,
  ) {
    await this.developmentService.dev_deleteUserBatch(body);
  }
}
