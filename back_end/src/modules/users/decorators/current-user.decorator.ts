import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { User } from '../entities/users.entity';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext): User => {
    const { currentUser } = context.switchToHttp().getRequest();
    if (!currentUser) {
      throw new UnauthorizedException('no user logged');
    }
    return currentUser;
  },
);
