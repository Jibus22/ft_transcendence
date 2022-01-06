import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SiteOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const logger = new Logger('💂‍♂️ Site Owner Guard'); //TODO REMOVE LOGGER HERE
    const session = context.switchToHttp().getRequest()?.session;

    return true; // TODO REMOVE !!!!!! ---- FOR TEST ONLY

    if (session && session.userId && session.isSiteOwner) {
      logger.log(`User id: ${session.userId}`);
      return true;
    }
    throw new UnauthorizedException();
  }
}
