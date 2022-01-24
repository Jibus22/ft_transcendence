import { INestApplication } from '@nestjs/common';
import { eventNames } from 'process';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { Events } from '../../../src/modules/chat/gateways/chat.gateway';

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
        case Events.NEW_MESSAGE:
          this.testForProperties(event.payload, [
            'id',
            'sender',
            'room_id',
            'body',
            'timestamp',
          ]);
          expect(typeof event.payload.timestamp).toBe('number');
          expect(new Date(event.payload.timestamp).toString()).toHaveLength(
            new Date(Date.now()).toString().length,
          );
          break;

        case Events.USER_ADDED:
        case Events.ROOM_PARTICIPANTS_UPDATED:
        case Events.PUBLIC_ROOM_UPDATED:
        case Events.PUBLIC_ROOM_CREATED:
        case Events.PUBLIC_ROOM_REMOVED:
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

        case Events.PUBLIC_USER_INFOS_UPDATED:
          this.testForProperties(event.payload, [
            'id',
            'login',
            'photo_url',
            'status',
          ]);
          break;

        case Events.USER_REMOVED:
        case Events.USER_MODERATION:
        case Events.USER_BANNED:
        case Events.USER_MUTED:
          throw new Error(`TEST EXPECTATION UNSET for ${event.ev}`);
          break;

        default:
          throw new Error(
            `Event [${event.ev}] should be one of these : ${JSON.stringify(
              Events,
              null,
              4,
            )}`,
          );
      }
    });
  }
}
