import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Events } from '../../../src/modules/chat/gateways/chat.gateway';
import { User } from '../../../src/modules/users/entities/users.entity';
import { CommonTest } from '../../helpers';
import { ChatHelpers } from '../helpers';
import { WsChatHelpers } from './ws_helpers';
import { io, Socket } from 'socket.io-client';

describe('WebSockets CHAT: listen to GLOBAL events', () => {
  const nbOfRooms = 25;
  let commons: CommonTest;
  let createdUsers: User[];
  let cookies: string[];
  let httpLoggedUser: Partial<User>;
  let wsLoggedUser: Partial<User>;
  let app: INestApplication;
  let token: string;
  let chatHelper: ChatHelpers;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);
    await app.init();
    await app.listen(3000);

    createdUsers = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {
        console.log(error);
      });
    expect(createdUsers.length).toEqual(commons.testUserBatch.length);

    /*
     ** HTTP API REQUEST ARE MADE WITH USER[0]: httpLoggedUser
     */

    httpLoggedUser = commons.testUserBatch[0];
    cookies = await commons.logUser(httpLoggedUser.login).then((response) => {
      httpLoggedUser.id = response.body.id;
      return commons.getCookies(response);
    });

    chatHelper = new ChatHelpers(
      cookies,
      httpLoggedUser,
      app,
      createdUsers,
      commons,
    );

    /*
     ** WEBSOCKER IS CONNECTED WITH USER[1]
     */

    WsChatHelpers.setupIo(app);
    wsLoggedUser = commons.testUserBatch[1];

    const tmpCookies: string[] = await commons
      .logUser(wsLoggedUser.login)
      .then((resp) => commons.getCookies(resp));

    await WsChatHelpers.getToken(tmpCookies).then((resp) => {
      token = resp.body?.token;
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(1);
    });

    WsChatHelpers.setupToken(token);
    WsChatHelpers.connectSocket();
  });

  afterEach(async () => {
    WsChatHelpers.closeSocket();
    await app.close();
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        PUBLIC ROOM EVENT
  -------------------------------------------------------------------
  ===================================================================
  */

  it(`listen to ${Events.PUBLIC_ROOM_CREATED} event for PUBLIC room`, async () => {

    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', () => expect(1).toBe(2));
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [],
            is_private: false,
          })
          .then((response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
          });
      }, 100);

      setTimeout(async () => {
        resolve('ok');
      }, 200);
    });
    expect(WsChatHelpers.events.length).toBe(2);
    const event = WsChatHelpers.events.pop();
    expect(event).toHaveProperty('ev', Events.PUBLIC_ROOM_CREATED);
    expect(Object.getOwnPropertyNames(event.payload)).toHaveLength(3);
    expect(event.payload).toHaveProperty('id');
    expect(event.payload).toHaveProperty('is_private', false);
    expect(event.payload).toHaveProperty('is_password_protected', false);
  });

  it(`listen to ${Events.PUBLIC_ROOM_CREATED} event for PRIVATE room`, async () => {
    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', () => expect(1).toBe(2));
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [],
            is_private: true,
          })
          .then((response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
          });
      }, 100);

      setTimeout(async () => {
        resolve('ok');
      }, 200);
    });
    expect(WsChatHelpers.events.length).toBe(1);
    expect(WsChatHelpers.events.pop().ev).toBe(Events.CONNECT);
  });

  it(`listen to ${Events.PUBLIC_ROOM_REMOVED} event for PUBLIC room`, async () => {
    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', () => expect(1).toBe(2));
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [],
            is_private: false,
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
            return await chatHelper.deleteRoom(cookies, response.body?.id);
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.OK);
          });
      }, 100);

      setTimeout(async () => {
        resolve('ok');
      }, 400);

      console.log(WsChatHelpers.events.length);
      WsChatHelpers.events.map(i => console.log(i));
      const events = WsChatHelpers.events;
      expect(events).toHaveLength(2);
    });
  });
}); // <<< end of describBlock
