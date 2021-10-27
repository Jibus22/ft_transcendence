/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {

    const request = context.switchToHttp().getRequest();
    if ( ! request.currentUser) {
      return false;
    }
    return request.currentUser.admin;
  }
}
