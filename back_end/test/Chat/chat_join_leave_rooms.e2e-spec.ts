import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ChatMessageDto } from '../../src/modules/chat/dto/chatMessade.dto';
import { createMessageDto } from '../../src/modules/chat/dto/create-message.dto';
import { ParticipantDto } from '../../src/modules/chat/dto/participant.dto';
import { FullRoomDto, RoomDto } from '../../src/modules/chat/dto/room.dto';
import { Participant } from '../../src/modules/chat/entities/participant.entity';
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

  it('join a public room', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
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

  it('join password protected rooms with WRONG password ', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
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
        LEAVE ROOM
  -------------------------------------------------------------------
  ===================================================================
  */

  async function leaveManyRooms(
    nbOfLeaves: number,
    createdRooms: RandomRoom[],
  ) {
    const joinedRooms = await chatHelper.getJoinedRooms();
    let joinedRoomsLen = joinedRooms.length;

    for (let i = 0; i < nbOfLeaves && joinedRooms.length > 0; i++) {
      const targetRoom = joinedRooms.at(joinedRooms.length - 1);
      const originalRoom = createdRooms.find((cr) => cr.id === targetRoom.id);
      await chatHelper.leaveRoom(cookies, targetRoom.id).then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
      joinedRooms.pop();
      const index = createdRooms.indexOf(originalRoom);
      createdRooms.slice(index, index);
      const newjoinedRoomsLen = await (
        await chatHelper.getJoinedRooms()
      ).length;

      expect(newjoinedRoomsLen).toBe(joinedRoomsLen - 1);
      joinedRoomsLen = newjoinedRoomsLen;
    }
  }

  it('leave some joined rooms', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const joinedRooms = await chatHelper.getJoinedRooms();
        expect(joinedRooms.length).not.toBe(0);
        await leaveManyRooms(joinedRooms.length, createdRooms);
      });
  });

  it('try leave rooms which user is NOT participant', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const unjoinedRooms = await chatHelper.getAllUnjoinedRooms();
        const userRoomsLen: number = await chatHelper
          .getUserRooms()
          .then((r) => r.body.length);

        expect(unjoinedRooms.length).not.toBe(0);
        await Promise.all(
          unjoinedRooms.map(async (r) => {
            await chatHelper.leaveRoom(cookies, r.id).then((response) => {
              expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
            });
          }),
        ).then(async () => {
          expect(
            await chatHelper.getUserRooms().then((r) => r.body.length),
          ).toBe(userRoomsLen);
        });
      });
  });

  it('try leave rooms which user is OWNER', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const ownedRooms = await chatHelper.getOwnedRooms();
        const userRoomsLen: number = await chatHelper
          .getOwnedRooms()
          .then((r) => r.length);

        expect(ownedRooms.length).not.toBe(0);
        await Promise.all(
          ownedRooms.map(async (r) => {
            await chatHelper.leaveRoom(cookies, r.id).then((response) => {
              expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            });
          }),
        ).then(async () => {
          expect(await chatHelper.getOwnedRooms().then((r) => r.length)).toBe(
            userRoomsLen,
          );
        });
      });
  });

}); // <<< end of describBlock
