import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import {
  Events,
  messageType,
} from '../../../src/modules/chat/gateways/chat.gateway';

export class WsChatHelpers {
  public static socket: Socket;
  public static app: INestApplication;
  public static events: { ev: Events; payload: any }[] = [];

  public static async setupIo(
    app: INestApplication,
    url: string = 'ws://localhost:3000/chat',
  ) {
    this.events = [];
    this.socket = io(url, {
      autoConnect: false,
      forceNew: true,
    });
    this.app = app;
  }

  public static async setupToken(token: string) {
    this.socket.auth = { key: token };
  }

  public static connectSocket() {
    return this.socket.connect();
  }

  public static closeSocket() {
    this.events = [];
    return this.socket.close();
  }

  public static async getToken(cookies: string[]) {
    return await request(this.app.getHttpServer())
      .get('/auth/ws/token')
      .set('Cookie', cookies);
  }

  private static setListenner(ev: Events, conn: Socket) {
    conn.on(ev, (payload) => {
      this.events.push({ ev, payload });
    });
  }

  public static setAllEventsListenners(conn: Socket) {
    for (let i in Events) {
      this.setListenner(Events[i], conn);
    }
  }

  public static testForProperties(candidate: any, reference: string[]) {
    expect(Object.getOwnPropertyNames(candidate)).toEqual(reference);
  }

  public static testEventsPayload(events = this.events) {

    events.forEach((event) => {
      switch (event.ev) {
        case Events.PUBLIC_ROOM_CREATED:
        case Events.PUBLIC_ROOM_REMOVED:
          this.testForProperties(event.payload, [
            'id',
            'is_private',
            'is_password_protected',
          ]);
          break;

        case Events.PUBLIC_ROOM_UPDATED:
          this.testForProperties(event.payload, [
            'id',
            'is_private',
            'is_password_protected',
            'participants',
          ]);
          break;

        case Events.CONNECT:
          expect(event.payload).toBeUndefined();
          break;

        default:
          throw new Error(`Event [${event.ev}] should be one of these : ${JSON.stringify(Events, null, 4)}`);
      }
    });
  }
}
