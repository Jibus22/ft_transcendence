import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '../modules/users/entities/users.entity';

@Injectable()
export class RoomOwnerGuard implements CanActivate {

  canActivate(context: ExecutionContext) {

		const logger = new Logger( '💂‍♂️ Room Owner Guard'); //TODO REMOVE LOGGER HERE
    const currentUser: User = context.switchToHttp().getRequest().currentUser;
    const targetRoom  = context.switchToHttp().getRequest().params.id;
    if (currentUser && targetRoom) {
      logger.log(`User id: ${currentUser.id}, trying to target room: ${targetRoom}`);
      return currentUser.rooms_ownership.some((room) => room.id === targetRoom);
    }
    throw new UnauthorizedException('User must be logged and own the room');
  }
}

