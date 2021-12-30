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
export class RoomOwnerGuard implements CanActivate {
  private isRoomOwned(currentUser: User, targetedRoom: Room): boolean {
    return targetedRoom.participants.some(
      (participant) =>
        participant.user.id === currentUser.id && participant.is_owner,
    );
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('💂‍♂️ Room Owner Guard'); //TODO REMOVE LOGGER HERE
    const currentUser: User = context.switchToHttp().getRequest().currentUser;
    const targetRoom: Room = context.switchToHttp().getRequest().targetedRoom;
    if (currentUser && targetRoom) {
      logger.log(
        `User id: ${currentUser.id}, trying to target room: ${targetRoom.id}`,
      );
      const ret = this.isRoomOwned(currentUser, targetRoom);
      logger.log(`ACCESS GRANTED ? ${ret}`);
      return ret;
    }
    throw new UnauthorizedException('User must be logged and own the room');
  }
}
