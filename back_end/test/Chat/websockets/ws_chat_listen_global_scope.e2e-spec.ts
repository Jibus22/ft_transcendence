import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Events } from '../../../src/modules/chat/gateways/chat.gateway';
import { User } from '../../../src/modules/users/entities/users.entity';
import { CommonTest } from '../../helpers';
import { ChatHelpers } from '../helpers';
import { WsChatHelpers } from './ws_helpers';

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

  async function createRoomAndDeleteIt(is_private: boolean) {
    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', (err) => {
      throw new Error(`There was a connection error: ${err}`);
    });
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve, rejects) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [],
            is_private,
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body.id).toBeDefined();
            return await chatHelper.deleteRoom(cookies, response.body.id);
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.OK);
          });
      }, 50);

      setTimeout(async () => {
        resolve('ok');
      }, 100);
    });

    const events = WsChatHelpers.events;

    const expectedEvents = is_private
      ? [ { ev: Events.CONNECT } ]
      : [
          { ev: Events.CONNECT },
          { ev: Events.PUBLIC_ROOM_CREATED },
          { ev: Events.PUBLIC_ROOM_REMOVED },
        ];

    expect(events).toHaveLength(expectedEvents.length);
    expect(events).toMatchObject(expectedEvents);

    WsChatHelpers.testEventsPayload();
  }

  it(`creats then delete a PUBLIC room`, async () => {
    await createRoomAndDeleteIt(false);
  });

  it(`creates the deletes a PRIVATE room`, async () => {
    await createRoomAndDeleteIt(true);
  });

  async function createRoomAndChangePassword(is_private: boolean) {
    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', (err) => {
      throw new Error(`There was a connection error: ${err}`);
    });
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve, rejects) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [],
            is_private,
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body.id).toBeDefined();
            return await chatHelper.updateRoomPassword(
              cookies,
              response.body.id,
              {
                password: 'new_password',
              },
            );
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.OK);
          });
      }, 150);

      setTimeout(async () => {
        resolve('ok');
      }, 250);
    });

    const events = WsChatHelpers.events;
    const expectedEvents = is_private
      ? [ { ev: Events.CONNECT } ]
      : [
          { ev: Events.CONNECT },
          { ev: Events.PUBLIC_ROOM_CREATED },
          { ev: Events.PUBLIC_ROOM_UPDATED },
        ];

    expect(events).toHaveLength(expectedEvents.length);
    expect(events).toMatchObject(expectedEvents);
    if (!is_private) {
      const updateEvent = events.find((e) => e.ev === Events.PUBLIC_ROOM_UPDATED);
      expect(updateEvent.payload.is_password_protected).toBeTruthy();
    }

    WsChatHelpers.testEventsPayload();
  }

  it(`creats then updates a PUBLIC room`, async () => {
    await createRoomAndChangePassword(false);
  });

  it(`creats then updates a PRIVATE room`, async () => {
    await createRoomAndChangePassword(true);
  });
}); // <<< end of describBlock
