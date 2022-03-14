import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers } from './helpers';

describe('CHAT: Participations manipulations', () => {
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
        Room participants
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a private room and add participant AFTER as owner', async () => {
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: true,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_private', true);
        return await chatHelper.addParticipant(cookies, createdRoom.id, {
          id: users[1].id,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms).toHaveLength(1);
        expect(rooms[0]).toHaveProperty('participants');
        expect(
          rooms[0].participants.some((p) => p.user.login === users[1].login),
        ).toBeTruthy();
      });
  });

  it('creates a private room and add participant AFTER as a moderator', async () => {
    let tmpCookies: string[];
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [{ id: users[1].id }],
        is_private: true,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms).toHaveLength(1);
        createdRoom = rooms[0];
        expect(createdRoom).toHaveProperty('is_private', true);
        return await chatHelper.updateModerators(cookies, createdRoom.id, {
          participant_id: createdRoom.participants.find(
            (p) => p.is_owner === false,
          ).id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        return await commons.logUser(users[1].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.addParticipant(tmpCookies, createdRoom.id, {
          id: users[2].id,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms).toHaveLength(1);
        expect(rooms[0]).toHaveProperty('participants');
        expect(
          rooms[0].participants.some((p) => p.user.login === users[1].login),
        ).toBeTruthy();
        expect(
          rooms[0].participants.some((p) => p.user.login === users[2].login),
        ).toBeTruthy();
      });
  });

  it('creates a private room and try to add participant AFTER as simple participant', async () => {
    let tmpCookies: string[];
    let createdRoom: RoomDto;

    await chatHelper
      .createSimpleRoom({
        participants: [],
        is_private: true,
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(createdRoom).toHaveProperty('is_private', true);
        return await commons.logUser(users[1].login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.addParticipant(tmpCookies, createdRoom.id, {
          id: users[2].id,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        return await chatHelper.getOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms).toHaveLength(1);
        expect(rooms[0]).toHaveProperty('participants');
        expect(
          rooms[0].participants.some((p) => p.user.login === users[1].login),
        ).toBeFalsy();
      });
  });
}); // <<< end of describBlock
