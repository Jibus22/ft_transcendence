import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
	new (...args: any[]) : {}
}

export function Serialize(dto: ClassConstructor) {
	return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {

	constructor(private dto: any) {}

	intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
		/*
		** code running before
		*/

		return handler.handle().pipe(
			map((data: any) => {
				/*
				** code running after
				*/
				return plainToInstance(this.dto, data, {
					excludeExtraneousValues: true,
				});
			})
		)

	}

}
