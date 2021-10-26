import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

	@Get('/hello')
  helloworld() {
    return { message: 'hello_world_transcendence, from backend' };
  }

}
