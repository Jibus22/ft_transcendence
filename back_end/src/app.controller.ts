import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

	@Get('/api_status')
  getHello() {
    return 'online';
  }

}
