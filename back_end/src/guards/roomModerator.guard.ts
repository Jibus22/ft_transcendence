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
export class RoomModeratorGuard implements CanActivate {
  private isRoomModerator(currentUser: User, targetedRoom: Room): boolean {
    return targetedRoom.participants.some(
      (participant) =>
        participant.user.id === currentUser.id && participant.is_moderator,
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💬 💂‍♂️ Room Moderator Guard'); //TODO REMOVE LOGGER HERE
    const currentUser: User = context.switchToHttp().getRequest()?.currentUser;
    const targetRoom: Room = context.switchToHttp().getRequest()?.targetedRoom;
    if (
      currentUser &&
      targetRoom &&
      this.isRoomModerator(currentUser, targetRoom)
    ) {
      logger.log(
        `User id: ${currentUser.id}, trying to target room: ${targetRoom}`,
      );
      logger.log(`MODERATOR ACCESS GRANTED !`);
      return true;
    }
    throw new UnauthorizedException('User must be logged and be moderator');
  }
}
