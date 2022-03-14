import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Room } from '../modules/chat/entities/room.entity';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class RoomOwnerGuard implements CanActivate {
  private isRoomOwned(currentUser: User, targetedRoom: Room): boolean {
    return targetedRoom.participants.some(
      (participant) =>
        participant.user.id === currentUser.id && participant.is_owner,
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Owner Guard');
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoom: Room = context.switchToHttp().getRequest()?.targetedRoom;
    if (
      currentUser &&
      targetRoom &&
      (this.isRoomOwned(currentUser, targetRoom) || currentUser.is_site_owner)
    ) {
      logger.debug(
        `User id: ${currentUser.id}, trying to target room: ${targetRoom.id}`,
      );
      logger.debug(`OWNER ACCESS GRANTED !`);
      return true;
    }
    logger.debug(`USER IS NOT OWNER OF THE ROOM 🚫 `);
    throw new ForbiddenException('User must be logged and own the room');
  }
}
