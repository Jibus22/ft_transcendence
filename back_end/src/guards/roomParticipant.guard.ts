import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Room } from '../modules/chat/entities/room.entity';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class RoomParticipantGuard implements CanActivate {
  private isRoomAccessible(currentUser: User, targetedRoom: Room): boolean {
    return targetedRoom.participants.some(
      (participant) => participant.user.id === currentUser.id,
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Participant Guard');
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoom: Room = context.switchToHttp().getRequest()?.targetedRoom;
    if (
      currentUser &&
      targetRoom &&
      (this.isRoomAccessible(currentUser, targetRoom) ||
        currentUser.is_site_owner)
    ) {
      logger.debug(
        `User id: ${currentUser.id}, trying to target room: ${targetRoom.id}`,
      );
      logger.debug(`ROOM PARTICIPANT ACCESS GRANTED !`);
      return true;
    }
    logger.debug(`USER IS NOT PARTICIPANT IN THIS ROOM 🚫 `);
    throw new UnauthorizedException(
      'User must be logged and be participant in the room',
    );
  }
}
