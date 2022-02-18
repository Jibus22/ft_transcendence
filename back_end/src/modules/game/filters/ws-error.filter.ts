import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsErrorFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    super.catch(exception, host);

    const client = host.switchToWs().getClient();
    const error = exception.getError();

    client.emit('myerror', error);
  }
}

// @Catch()
// export class WsErrorFilter<T> implements ExceptionFilter {
//   catch(exception: T, host: ArgumentsHost) {}
// }
