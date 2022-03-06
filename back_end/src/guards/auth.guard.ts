import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  private isTwoFaOk(session): boolean {
    return (
      !session.useTwoFA || (session.useTwoFA && session.isTwoFAutanticated)
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('🚪 💂‍♂️ AuthGuard');
    const session = context.switchToHttp().getRequest()?.session;
    const user: User = context.switchToHttp().getRequest()?.currentUser;
    if (user && session.userId && this.isTwoFaOk(session)) {
      logger.debug(`User id: ${user.id}`);
      return true;
    }
    logger.debug(`USER IS NOT LOGGED 🚫 `);
    throw new UnauthorizedException('user must be logged');
  }
}
