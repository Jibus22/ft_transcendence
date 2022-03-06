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
export class RoomPublicGuard implements CanActivate {
  private isRoomPublic(currentUser: User, targetedRoom: Room): boolean {
    return !targetedRoom.is_private;
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Public Guard');
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoom: Room = context.switchToHttp().getRequest()?.targetedRoom;
    if (
      currentUser &&
      targetRoom &&
      this.isRoomPublic(currentUser, targetRoom)
    ) {
      logger.debug(
        `User id: ${currentUser.id}, trying to target room: ${targetRoom}`,
      );
      logger.debug(`PUBLIC ROOM ACCESS GRANTED !`);
      return true;
    }
    logger.debug(`ROOM IS NOT PUBLIC 🚫 `);
    throw new UnauthorizedException(
      'User must be logged and target a Public Room',
    );
  }
}
