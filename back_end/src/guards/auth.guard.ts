import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  private isTwoFaOk(session): boolean {
    return (
      !session.useTwoFA || (session.useTwoFA && session.isTwoFAutanticated)
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💂‍♂️ AuthGuard'); //TODO REMOVE LOGGER HERE
    const session = context.switchToHttp().getRequest().session;
    if (session && session.userId && this.isTwoFaOk(session)) {
      logger.log(`User id: ${session.userId}`);
      return true;
    }
    throw new UnauthorizedException();
  }
}
