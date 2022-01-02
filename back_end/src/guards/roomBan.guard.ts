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
export class RoomBanGuard implements CanActivate {
  private isUserBanned(
    currentUser: User,
    targetRoomBan: Restriction[],
  ): boolean {
    return targetRoomBan.some((r) => r.user.id === currentUser.id);
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Ban Guard'); //TODO REMOVE LOGGER HERE
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoomBan: Restriction[] = context
      .switchToHttp()
      .getRequest()?.targetedRoomActiveBan;

    if (
      currentUser &&
      targetRoomBan &&
      this.isUserBanned(currentUser, targetRoomBan) === false
    ) {
      logger.log(`BAN ACCESS GRANTED, user is not banned !`);
      return true;
    }
    throw new UnauthorizedException('User is banned');
  }
}
