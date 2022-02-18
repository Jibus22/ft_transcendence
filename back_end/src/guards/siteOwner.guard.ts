import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class SiteOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const logger = new Logger('🔓 💂‍♂️ Site Owner Guard');
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    if (currentUser && currentUser.is_site_owner) {
      logger.debug(`User id: ${currentUser.id}`);
      logger.debug(`SITE OWNER ACCESS GRANTED !`);
      return true;
    }
    throw new ForbiddenException('User must be site owner');
  }
}
