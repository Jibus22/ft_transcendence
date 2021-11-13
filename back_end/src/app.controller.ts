import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

	@Get('/api_status')
  getHello() {
    console.log(process.env.COOKIE_KEY);
    return 'online';
  }

}
