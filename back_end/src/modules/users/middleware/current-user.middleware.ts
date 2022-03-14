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
    const logger = new Logger(' 🛠 👥  User Middlewear');
    logger.log('💌', `New request: ${req.method} ${req.baseUrl}`);

    const { userId } = req.session || {};
    if (!userId) {
      logger.debug('No user id in session');
      return next();
    }

    const currentUser = await this.usersService
      .findOneWithRelations(userId)
      .catch((error) => {
        logger.debug(error);
      });

    if (currentUser) {
      logger.debug(`By user: ${currentUser.login} - ${currentUser.id}`);
      req.currentUser = currentUser as User;
    } else {
      logger.debug(`User Not Found from ${currentUser}: Clearing Session`);
      this.authService.clearSession(req.session);
    }

    next();
  }
}
