import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ChatService } from '../../src/modules/chat/chat.service';
import { ParticipantDto } from '../../src/modules/chat/dto/participant.dto';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers, RandomRoom } from './helpers';
var faker = require('faker');

describe('CHAT: Join/leave rooms', () => {
  const nbOfRooms = 25;
  let app: INestApplication;
  let chatHelper: ChatHelpers;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;
  let getNowValue: number;

  beforeEach(async () => {
    getNowValue = Date.now();
    jest
      .spyOn(ChatService.prototype, 'getNow')
      .mockImplementation(() => getNowValue);

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
        JOIN ROOM
  -------------------------------------------------------------------
  ===================================================================
  */

  async function joinManyRooms(
    nbOfJoins: number,
    publicRooms: RoomDto[],
    createdRooms: RandomRoom[],
  ) {
    let userRoomsLen = await (
      await chatHelper.getUserRooms().then((r) => r.body as RoomDto[])
    ).length;

    for (let i = 0; i < nbOfJoins && publicRooms.length > 0; i++) {
      const targetRoom = publicRooms.at(publicRooms.length - 1);
      const originalRoom = createdRooms.find((cr) => cr.id === targetRoom.id);
      await chatHelper
        .joinRoom(cookies, targetRoom.id, {
          password: originalRoom.password,
        })
        .then((response) => {
          expect(response.status).toBe(HttpStatus.OK);
        });
      publicRooms.pop();
      const index = createdRooms.indexOf(originalRoom);
      createdRooms.slice(index, index);

      const newUserRoomsLen = (
        await chatHelper.getUserRooms().then((r) => r.body as RoomDto[])
      ).length;
      expect(newUserRoomsLen).toBe(userRoomsLen + 1);
      userRoomsLen = newUserRoomsLen;
    }
  }

  it('join many random public rooms, with/without password', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const unjoindedPublicRooms = await chatHelper.getPublicUnjoinedRooms();
        expect(unjoindedPublicRooms.length).not.toBe(0);

        await joinManyRooms(
          unjoindedPublicRooms.length,
          unjoindedPublicRooms,
          createdRooms,
        );
      });
  });

  it('try join a private room', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const unjoindedPrivateRooms =
          await chatHelper.getPrivateUnjoinedRooms();
        const targetRoom = unjoindedPrivateRooms.find(
          (r) => r.is_password_protected === false,
        );
        expect(targetRoom).toBeDefined();
        return await chatHelper.joinRoom(cookies, targetRoom.id);
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  async function joinManyRoomsWithWrongPassword(
    nbOfJoins: number,
    publicRooms: RoomDto[],
    createdRooms: RandomRoom[],
  ) {
    let userRoomsLen = await (
      await chatHelper.getUserRooms().then((r) => r.body as RoomDto[])
    ).length;

    for (let i = 0; i < nbOfJoins && publicRooms.length > 0; i++) {
      const targetRoom = publicRooms.at(publicRooms.length - 1);
      const originalRoom = createdRooms.find((cr) => cr.id === targetRoom.id);
      await chatHelper
        .joinRoom(cookies, targetRoom.id, {
          password: originalRoom.password + 'wrong_password',
        })
        .then((response) => {
          expect(response.status).toBe(HttpStatus.FORBIDDEN);
          expect(response.body.error).toBe('invalid password');
        });
      publicRooms.pop();
      const index = createdRooms.indexOf(originalRoom);
      createdRooms.slice(index, index);

      const newUserRoomsLen = (
        await chatHelper.getUserRooms().then((r) => r.body as RoomDto[])
      ).length;
      expect(newUserRoomsLen).toBe(userRoomsLen);
    }
  }

  it('try join password protected rooms with WRONG password ', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms, 0, 0.2, 1)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const unjoindedPublicRooms =
          await chatHelper.getPublicPasswordProtectedUnjoinedRooms();
        expect(unjoindedPublicRooms.length).not.toBe(0);

        await joinManyRoomsWithWrongPassword(
          unjoindedPublicRooms.length,
          unjoindedPublicRooms,
          createdRooms,
        );
      });
  });

  /*
    ===================================================================
    -------------------------------------------------------------------
          JOINING BANNED ROOMS
    -------------------------------------------------------------------
    ===================================================================
    */

  it('try join a room after being banned from it ', async () => {
    let createdRooms: RandomRoom[];
    let targetRoom: RoomDto;
    let targetParticipant: ParticipantDto;
    let tmpCookies: string[];
    const banDuration = 10;
    const testSize = 2;

    await chatHelper
      .generateManyRandomRoomsForLoggedUser(testSize, 0, 1, 0)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(testSize);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const userRooms = await chatHelper.getOwnedRooms();
        expect(userRooms.length).toBe(testSize);
        targetRoom = userRooms.find(
          (r) =>
            r.participants.length >= 2 &&
            r.is_password_protected === false &&
            r.is_private === false,
        );
        expect(targetRoom).toBeDefined();
        targetParticipant = targetRoom.participants.find((p) => !p.is_owner);
        expect(targetParticipant).toBeDefined();
        return await chatHelper.addRestriction(cookies, targetRoom.id, {
          user_id: targetParticipant.user.id,
          restriction_type: 'ban',
          duration: banDuration,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await commons.logUser(targetParticipant.user.login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.joinRoom(tmpCookies, targetRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body).toHaveProperty('message', 'User is banned');
        /*
         ** Change getNow returned value to emulate time passing and ban expiring
         */
        getNowValue = Date.now() + 1000 * 60 * (banDuration + 1);
        return await chatHelper.joinRoom(tmpCookies, targetRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
}); // <<< end of describBlock
