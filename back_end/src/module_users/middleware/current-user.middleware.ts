import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../service_users/users.service";
import { User } from "../entities/users.entity";

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

		if (userId) {
			// FIXME current user is not valid after call to PATCH /me. Probably need to update session in response too ?
			const user = await this.usersService.findOne(userId);
			req.currentUser = user;
		}

		next();
	}
}
