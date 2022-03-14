import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Events } from '../../../src/modules/chat/gateways/chat.gateway';
import { User } from '../../../src/modules/users/entities/users.entity';
import { CommonTest } from '../../helpers';
import { WsChatHelpers } from './ws_helpers';

describe('WebSockets CHAT: connection', () => {
  const nbOfRooms = 25;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);
    loggedUser = commons.testUserBatch[0];
    await app.init();
    await app.listen(3000);

    users = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {
        console.log(error);
      });
    expect(users.length).toEqual(commons.testUserBatch.length);

    cookies = await commons.logUser(loggedUser.login).then((response) => {
      loggedUser.id = response.body.id;
      return commons.getCookies(response);
    });

    WsChatHelpers.setupIo(app);
    await WsChatHelpers.getToken(cookies).then((resp) => {
      token = resp.body?.token;
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(1);
    });
  });

  afterEach(async () => {
    await app.close();
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES
  -------------------------------------------------------------------
  ===================================================================
  */

  it('connects the websocket', (done) => {
    WsChatHelpers.setupToken(token);
    WsChatHelpers.connectSocket();
    let isLogged = true;
    WsChatHelpers.socket.on('connect_error', () => {
      isLogged = false;
    });
    setTimeout(() => {
      expect(isLogged).toBeTruthy();
      if (isLogged) {
        WsChatHelpers.closeSocket();
      }
      done();
    }, 100);
  });

  it('refuse connection with a wrong token', (done) => {
    WsChatHelpers.setupToken(token + '____INVALID_TOKEN____');
    WsChatHelpers.connectSocket();
    let isLogged = true;
    WsChatHelpers.socket.on('connect_error', () => {
      isLogged = false;
    });
    setTimeout(() => {
      expect(isLogged).toBeFalsy();
      if (isLogged) {
        WsChatHelpers.closeSocket();
      }
      done();
    }, 100);
  });

  it('try to get a token with invalid cookie', async () => {
    await WsChatHelpers.getToken(['_', '_']).then((response) => {
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  it('changes status depending on websocket connection', async () => {
    WsChatHelpers.setupToken(token);
    WsChatHelpers.connectSocket();
    let isLogged = true;
    WsChatHelpers.socket.on('connect_error', () => {
      isLogged = false;
    });
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(isLogged);
      }, 100),
    )
      .then(async (isLoggedValue) => {
        expect(isLoggedValue).toBeTruthy();
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('status', 'online');
        WsChatHelpers.closeSocket();
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve('ok');
          }, 100),
        );
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('status', 'offline');
      });
  });
}); // <<< end of describBlock
