import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
	(data: never, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();
		// return request.currentUser;
		return request.session.userId;
	}

)
