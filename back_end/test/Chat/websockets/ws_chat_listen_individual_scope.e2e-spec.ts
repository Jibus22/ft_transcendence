import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Participant } from '../../../src/modules/chat/entities/participant.entity';
import { Events } from '../../../src/modules/chat/gateways/chat.gateway';
import { User } from '../../../src/modules/users/entities/users.entity';
import { CommonTest } from '../../helpers';
import { ChatHelpers } from '../helpers';
import { WsChatHelpers } from './ws_helpers';
var faker = require('faker');

describe('WebSockets CHAT: listen to GLOBAL events', () => {
  const nbOfRooms = 25;
  let commons: CommonTest;
  let createdUsers: User[];
  let httpUserCookie: string[];
  let wsUserCookie: string[];
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
    httpUserCookie = await commons
      .logUser(httpLoggedUser.login)
      .then((response) => {
        httpLoggedUser.id = response.body.id;
        return commons.getCookies(response);
      });
    await commons
      .getMe(httpUserCookie)
      .then((r) => (httpLoggedUser.id = r.body?.id));
    expect(httpLoggedUser.id).not.toHaveLength(0);

    chatHelper = new ChatHelpers(
      httpUserCookie,
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

    wsUserCookie = await commons
      .logUser(wsLoggedUser.login)
      .then((resp) => commons.getCookies(resp));
    await commons
      .getMe(wsUserCookie)
      .then((r) => (wsLoggedUser.id = r.body?.id));
    expect(wsLoggedUser.id).not.toHaveLength(0);

    await WsChatHelpers.getToken(wsUserCookie).then((resp) => {
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
        PARTICIPATION EVENT
  -------------------------------------------------------------------
  ===================================================================
  */


 it(`listen to ${Events.ROOM_PARTICIPANTS_UPDATED} event for a participating room, after someone leave the room`, async () => {
    let roomId: string;
    WsChatHelpers.setupToken(token);
    const conn = WsChatHelpers.connectSocket();
    conn.on('connect_error', () => {
      throw new Error('Should not receive this event');
    });
    WsChatHelpers.setAllEventsListenners(conn);

    await new Promise((resolve, rejects) => {
      setTimeout(async () => {
        await chatHelper
          .createSimpleRoom({
            participants: [{ id: wsLoggedUser.id }],
            is_private: true,
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
            roomId = response.body?.id;
            expect(roomId).toBeDefined();
            expect(roomId).not.toHaveLength(0);
            return await chatHelper.addParticipant(httpUserCookie, roomId, {
              id: createdUsers[2].id, // <--------- new user added to generate event
            });
          })
          .then(async (response) => {
            const cookiesForUser2 = await commons
              .logUser(createdUsers[2].login)
              .then((resp) => commons.getCookies(resp))
              .catch((err) => {
                throw new Error(`Signin should have worked: ${err}`);
              });
            return await chatHelper.leaveRoom(cookiesForUser2, roomId);
          })
          .then(async (response) => {
            expect(response.status).toBe(HttpStatus.OK);
          });
      }, 100);

      setTimeout(async () => {
        resolve('ok');
      }, 250);
    });

    const events = WsChatHelpers.events;
    const expectedEvents = [
      { ev: Events.CONNECT },
      { ev: Events.USER_ADDED },
      { ev: Events.ROOM_PARTICIPANTS_UPDATED },
      { ev: Events.ROOM_PARTICIPANTS_UPDATED },
      { ev: Events.ROOM_PARTICIPANTS_UPDATED },
      { ev: Events.ROOM_PARTICIPANTS_UPDATED },
    ];

    expect(events).toHaveLength(expectedEvents.length);
    expect(events).toMatchObject(expectedEvents);

    WsChatHelpers.testEventsPayload();
  });
}); // <<< end of describBlock
