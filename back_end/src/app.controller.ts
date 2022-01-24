import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatGateway } from './modules/chat/gateways/chat.gateway';
import { ChatGatewayService } from './modules/chat/gateways/chatGateway.service';

@Controller()
export class AppController {
  constructor(private gateway: ChatGatewayService) {}

  @Get('/api_status')
  @ApiOperation({
    summary: "Get api's status",
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'return if online' })
  async getOnline() {
    console.debug('SOCKET LIST ', await this.gateway.allSockets());
    return 'online';
  }
}
