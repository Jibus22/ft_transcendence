/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DebugGuard implements CanActivate {

 constructor(private configService: ConfigService ) {}

  canActivate(context: ExecutionContext) {
    return this.configService.get('ENV_MODE') === 'dev';
  }
}
