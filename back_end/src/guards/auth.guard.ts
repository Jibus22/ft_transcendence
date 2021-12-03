import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { serialize } from 'class-transformer';

@Injectable()
export class AuthGuard implements CanActivate {

  private isTwoFaOk(session): boolean {
    return (session.hasTwoFaAuthenticated === false
      || (session.hasTwoFaAuthenticated && session.isTwoFaAuthenticated));
  }

  canActivate(context: ExecutionContext) {

		const logger = new Logger( '💂‍♂️ AuthGuard'); //TODO REMOVE LOGGER HERE
    const session = context.switchToHttp().getRequest().session;
    console.log(session.hasTwoFaAuthenticated);
    console.log(this.isTwoFaOk(session));
    if (session.userId && this.isTwoFaOk(session)) {
      logger.log(`User id: ${session.userId}`);
      return true;
    }
    logger.log(`No user`);
    throw new UnauthorizedException();
  }
}
