import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/users.entity';
import { AuthService } from '../service-auth/auth.service';
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
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // if (req.baseUrl.includes('/socket.io')) { // TODO remove debug
    //   return next();
    // }

    const { userId } = req.session || {};
    const logger = new Logger(' 🛠 👥  User Middlewear');
    logger.log('💌', `New request: ${req.method} ${req.baseUrl}`);
    if (userId) {
      await this.usersService
        .findOneWithRelations(userId)
        .then((user) => {
          logger.log(`By user: ${user.login}`); // TODO remove debug
          req.currentUser = user;
        })
        .catch((error) => {
          logger.log('User Not Found: Clearing Session'); // TODO remove debug
          logger.log(error); // TODO remove debug
          this.authService.clearSession(req.session);
        });
    } else {
      logger.log('No user id in session');
    }
    next();
  }
}
