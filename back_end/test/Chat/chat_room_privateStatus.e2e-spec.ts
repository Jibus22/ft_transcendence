import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers } from './helpers';
var faker = require('faker');

describe('CHAT: Room isPrivate status manipulations', () => {
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

  it('creates a simple public room and change it to private', async () => {
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: false,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_password_protected', false);
        expect(createdRoom).toHaveProperty('is_private', false);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(createdRoom.id);
        return await chatHelper.updateIsPrivateStatus(cookies, createdRoom.id, {
          is_private: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
      });
  });

  it('creates a simple private room and change it to public', async () => {
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: true,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_password_protected', false);
        expect(createdRoom).toHaveProperty('is_private', true);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
        return await chatHelper.updateIsPrivateStatus(cookies, createdRoom.id, {
          is_private: false,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(createdRoom.id);
      });
  });

  it('creates a simple private room and change it with the same value', async () => {
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: true,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_password_protected', false);
        expect(createdRoom).toHaveProperty('is_private', true);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
        return await chatHelper.updateIsPrivateStatus(cookies, createdRoom.id, {
          is_private: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
      });
  });
}); // <<< end of describBlock
