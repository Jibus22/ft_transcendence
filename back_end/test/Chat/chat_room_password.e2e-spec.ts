import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers } from './helpers';
var faker = require('faker');

describe('CHAT: Room Password manipulations', () => {
  const nbOfRooms = 25;
  let app: INestApplication;
  let chatHelper: ChatHelpers;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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
    expect(cookies.length).toBeGreaterThanOrEqual(1);
    chatHelper = new ChatHelpers(cookies, loggedUser, app, users, commons);
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        Room passwords
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a simple public room with password and CHANGE PASSWORD', async () => {
    const passwords: string[] = [
      faker.internet.password(),
      faker.internet.password(),
    ];
    let tmpCookies: string[];
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: false,
        password: passwords[0],
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_password_protected', true);
        return await commons.logUser(users[1].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id, {
          password: passwords[0],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await commons.logUser(users[2].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        return await chatHelper.updateRoomPassword(tmpCookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        return await chatHelper.updateRoomPassword(cookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('creates a simple public room with password and UNSET PASSWORD', async () => {
    const passwords: string[] = [faker.internet.password(), ''];
    let tmpCookies: string[];
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: false,
        password: passwords[0],
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_password_protected', true);
        return await commons.logUser(users[1].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id, {
          password: passwords[0],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.updateRoomPassword(tmpCookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        return await chatHelper.updateRoomPassword(cookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id, {
          password: passwords[1],
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await commons.logUser(users[2].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.joinRoom(tmpCookies, createdRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
}); // <<< end of describBlock
