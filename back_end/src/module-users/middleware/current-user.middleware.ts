import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/users.entity';
import { UsersService } from '../service-users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

/** Extracts the userId from the session object into the request object */

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};
    const logger = new Logger(' 🛠 ⛓ Middlewear'); //TODO REMOVE LOGGER HERE
    if (userId) {
      await this.usersService
        .findOneWithRelations(userId)
        .then((user) => {
          logger.log(user.login); // TODO remove debug
          req.currentUser = user;
        })
        .catch((error) => {
          req.session = null;
        });
			} else {
        logger.log('No user id in session');
      }

    next();
  }
}
