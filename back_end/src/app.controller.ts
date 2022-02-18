import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from './modules/users/decorators/current-user.decorator';
import { User } from './modules/users/entities/users.entity';
import { UsersService } from './modules/users/service-users/users.service';

@Controller()
export class AppController {
  constructor() {}

  @Get('/api_status')
  @ApiOperation({
    summary: "Get api's status",
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'return if online' })
  async getOnline() {
    return 'online';
  }
}
