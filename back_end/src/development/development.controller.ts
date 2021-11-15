import {
  Controller,
  Get,
  Session,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DevGuard } from '../guards/dev.guard';
import { User } from '../users/entities/users.entity';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { DevelopmentService } from './development.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { devUserDto } from './dtos/devUser.dto';

@ApiTags('DevTools')
@Serialize(devUserDto)
@UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @ApiProperty()
  @Get('/hello')
  hello() {
    return 'hello world from dev';
  }

  @ApiProperty()
  @Post('/signin')
  async logDebugUser(@Body() user: Partial<User>, @Session() session: any) {
    session.userId = await this.developmentService.debug_logUser(user.login);
    return session.userId;
  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: CreateUserDto[] | CreateUserDto,
    @Session() session: any,
    ) {
      const users: Partial<User>[] = body as CreateUserDto[];
      return await this.developmentService.debug_createUserBatch(users);
    }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
    @Session() session: any,
  ) {
    await this.developmentService.debug_deleteUserBatch(body);
  }
}
