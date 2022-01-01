import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import exp from 'constants';
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

  it('try join a private room', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const unjoindedPrivateRooms = await chatHelper.getPrivateUnjoinedRooms();
        const targetRoom = unjoindedPrivateRooms.find( r => r.is_password_protected === false);
        expect(targetRoom).toBeDefined();
        return await chatHelper.joinRoom(cookies, targetRoom.id);
      })
      .then(response => {
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

}); // <<< end of describBlock
