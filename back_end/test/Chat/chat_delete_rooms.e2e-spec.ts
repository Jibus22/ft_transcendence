import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { Participant } from '../../src/modules/chat/entities/participant.entity';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers, RandomRoom } from './helpers';
var faker = require('faker');

describe('CHAT: Room Creation', () => {
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
        Room creation
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates many random rooms and delete all of them', async () => {
    let createdRooms: RandomRoom[];
    let returnedRooms: RoomDto[];
    const localNbOfRooms = 5;

    await chatHelper
      .generateManyRandomRoomsForLoggedUser(localNbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(localNbOfRooms);
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        returnedRooms = response.body as RoomDto[];
        expect(returnedRooms.length).toEqual(createdRooms.length);
        while (returnedRooms.length) {
          const delRoom = returnedRooms.pop();
          await chatHelper.deleteRoom(cookies, delRoom.id).then((response) => {
            expect(response.status).toBe(HttpStatus.OK);
          });
        }
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        returnedRooms = response.body as RoomDto[];
        expect(returnedRooms.length).toEqual(0);
      });
  });

  it('creates many random rooms and try to delete not owned rooms', async () => {
    let createdRooms: RandomRoom[];
    let returnedRooms: RoomDto[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        returnedRooms = response.body as RoomDto[];
        return await chatHelper.getOwnedRooms();
      })
      .then(async (ownedRooms) => {
        const originalReturnedRoomLen = returnedRooms.length;
        const targetRooms = returnedRooms.filter(
          (retRoom) =>
            !ownedRooms.some((ownedRoom) => ownedRoom.id === retRoom.id),
        );
        expect(targetRooms.length).toBe(
          originalReturnedRoomLen - ownedRooms.length,
        );
        while (targetRooms.length) {
          const delRoom = targetRooms.pop();
          await chatHelper.deleteRoom(cookies, delRoom.id).then((response) => {
            expect(response.status).toBe(HttpStatus.FORBIDDEN);
            expect(response.body.message).toMatch(/own the room/);
          });
        }
      });
  });
}); // <<< end of describBlock
