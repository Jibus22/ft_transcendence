/*
https://docs.nestjs.com/guards#guards
*/

import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { serialize } from 'class-transformer';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {

		const logger = new Logger( '💂‍♂️ AuthGuard'); //TODO REMOVE LOGGER HERE

    const request = context.switchToHttp().getRequest();
    logger.log(`User id: ${request.session.userId}`);

    if (request.session.userId)
      return true;
    throw new UnauthorizedException();
  }
}
