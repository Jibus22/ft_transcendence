import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createServer, Server } from 'http';
import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/modules/users/entities/users.entity';
import { CommonTest } from '../../helpers';
import { ChatHelpers } from '../helpers';
import { SocketService } from './socket.service';
import { WsChatHelpers } from './ws_helpers';

var faker = require('faker');

describe('WebSockets CHAT: connection', () => {
  const nbOfRooms = 25;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;
  let socket: SocketService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();

    commons = new CommonTest(app);

    loggedUser = commons.testUserBatch[0];
    await app.init();

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

    WsChatHelpers.startServer(app);
    socket = WsChatHelpers.createSocket(true);
  });

  afterEach(async () => {
    WsChatHelpers.closeSocket();
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES
  -------------------------------------------------------------------
  ===================================================================
  */

  it('connects to WebSocket with a token', async () => {
    let token: string;

    await WsChatHelpers.getToken(cookies)
    .then((response) => {
      token = response.body?.token;
      expect(token.length).toBeGreaterThan(1);
    })
    .then(() => {
      socket.setToken(token);
      socket.open();
      // socket.on('newPublicRoom').
      // socket.once('connect').pipe(tap(() => expect(true).toBeTruthy()));
    });

    // await wsChatHelper.getToken(cookies).then((response) => {
    //   const token = response.body?.token;
    //   expect(token).toBeDefined();
    //   expect(token.length).toBeGreaterThan(1);
    //   const ws = new WebSocket(`ws://localhost:3000/chat`);
    //   console.log(ws);
    // });
  });
}); // <<< end of describBlock
