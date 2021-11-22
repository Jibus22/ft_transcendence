import {
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../service_users/users.service';
import { User } from '../entities/users.entity';

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
        .findOne(userId)
        .then((user) => {
          logger.log(user.login);
          req.currentUser = user;
        })
        .catch((error) => {
					throw new ForbiddenException();
        });
			} else {
				logger.log('No user id in session');
		}

    next();
  }
}
