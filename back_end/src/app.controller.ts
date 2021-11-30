import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {

	@Get('/api_status')
  @ApiOperation({
    summary: 'Get api\'s status',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'return if online' })
  getOnline() {
    return 'online';
  }

}
