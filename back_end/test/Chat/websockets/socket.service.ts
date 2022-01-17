import { debounceTime, Observable, share, tap } from 'rxjs';
import { connect, Socket } from 'socket.io-client';

enum NATIVE_EVENTS {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
}

export class SocketService {
  private host: string = 'ws://localhost:3000';
  private events$: Record<string, Observable<any>> = {};
  socket: Socket;

  errors$: Observable<any>;
  isConnected$: Observable<boolean>;

  constructor(defer?: boolean, token?: string) {
    this.socket = connect(this.host, {
      autoConnect: !defer,
      forceNew: true,
      auth: {
        key: token? token : '',
      },
    });

    this.errors$ = this.on('disconnect-reason');

    this.on<string>(NATIVE_EVENTS.DISCONNECT)
      .pipe(
        tap((reason) => `disconnected: ${reason}`),
        debounceTime(5000),
      )
      .subscribe((reason) => {
        if (reason === 'io server disconnect') {
        }
      });
  }

  on<T = any>(event: string): Observable<T> {
    if (this.events$[event]) {
      return this.events$[event];
    }

    this.events$[event] = new Observable<T>((observer) => {
      this.socket.on(event, observer.next.bind(observer));
      return () => {
        this.socket.off(event);
        delete this.events$[event];
      };
    }).pipe(share());

    return this.events$[event];
  }

  setToken(token: string) {
      this.socket.auth = { key: token};
  }

  open() {
      this.socket.connect();
  }

  close() {
      this.socket.disconnect();
  }

}
