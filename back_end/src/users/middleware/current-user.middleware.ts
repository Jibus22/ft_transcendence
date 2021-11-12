import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../users.service";
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
			const user = await this.usersService.findOne(userId);
			req.currentUser = user;
		}

		next();
	}
}
