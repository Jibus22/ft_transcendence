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

@UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @Get('/hello')
  hello() {
    return 'hello world from dev';
  }

  @Post('/signin')
  async logDebugUser(@Body() user: Partial<User>, @Session() session: any) {
    session.userId = await this.developmentService.debug_logUser(user.login);
    return user;
  }

  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: CreateUserDto[] | CreateUserDto,
    @Session() session: any,
  ) {
    const users: Partial<User>[] = body as CreateUserDto[];
    return await this.developmentService.debug_createUserBatch(users);
  }

  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
    @Session() session: any,
  ) {
    await this.developmentService.debug_deleteUserBatch(body);
  }
}
