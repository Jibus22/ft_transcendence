import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Restriction } from '../modules/chat/entities/restriction.entity';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class RoomMuteGuard implements CanActivate {
  private isUserMutted(
    currentUser: User,
    targetRoomMute: Restriction[],
  ): boolean {
    return targetRoomMute.some((r) => r.user.id === currentUser.id);
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Mute Guard');
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoomMute: Restriction[] = context
      .switchToHttp()
      .getRequest()?.targetedRoomActiveMute;

    if (
      currentUser &&
      targetRoomMute &&
      (this.isUserMutted(currentUser, targetRoomMute) === false ||
        currentUser.is_site_owner)
    ) {
      logger.debug(`MUTE ACCESS GRANTED, user is not mutted !`);
      return true;
    }
    logger.debug(`USER IS MUTED 🚫 `);
    throw new UnauthorizedException('User is muted');
  }
}
