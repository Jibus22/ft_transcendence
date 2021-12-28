import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { User } from '../../users/entities/users.entity';

export const TargetedRoom = createParamDecorator(
  (data: never, context: ExecutionContext): User => {
    const { targetedRoom } = context.switchToHttp().getRequest();
    if (!targetedRoom) {
      throw new UnauthorizedException('no room targeted');
    }
    return targetedRoom;
  },
);
