import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

	@Get('/hello')
  helloworld() {
    return { message: 'hello_world_transcendence, from backend' };
  }

}
