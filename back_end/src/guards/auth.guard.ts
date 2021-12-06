import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { serialize } from 'class-transformer';

@Injectable()
export class AuthGuard implements CanActivate {

  private isTwoFaOk(session): boolean {
    return ( ! session.useTwoFA
      || (session.useTwoFA && session.isTwoFAutanticated));
  }

  canActivate(context: ExecutionContext) {

		const logger = new Logger( '💂‍♂️ AuthGuard'); //TODO REMOVE LOGGER HERE
    const session = context.switchToHttp().getRequest().session;
    // TODO remove debug
    // console.log('_____________');
    // console.log('use 2fa', session.useTwoFA);
    // console.log('is 2fa auth', session.isTwoFAutanticated);
    // console.log('user id', session.userId);
    if (session.userId && this.isTwoFaOk(session)) {
      logger.log(`User id: ${session.userId}`);
      return true;
    }
    throw new UnauthorizedException();
  }
}

