/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevGuard implements CanActivate {

 constructor(private configService: ConfigService ) {}

  canActivate(context: ExecutionContext) {
    const env = this.configService.get('NODE_ENV');
    return env === 'developement' || env === 'test' ;
  }
}
