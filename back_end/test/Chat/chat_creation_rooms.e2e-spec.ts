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

  it('creates a simple private room with participants', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [{ login: users[1].login }, { id: users[2].id }],
        is_private: true,
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('is_private', true);
      });
  });

  it('creates a simple private room with wrong participant', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [{ photo_url: users[5].photo_url_42 }],
        is_private: true,
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('is_private', true);
      });

    await chatHelper.getAllRooms().then((response) => {
      expect(response.body[0].participants).toHaveLength(1);
    });
  });

  it('creates a simple private room with non existing participants', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [
          { login: 'non_existing_user_login' },
          { id: users[2].id },
        ],
        is_private: true,
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('is_private', true);
      });
  });

  it('creates a simple private room with some invalid key in body', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [
          { login: 'non_existing_user_login' },
          { id: users[2].id },
        ],
        some_key: true,
        is_private: true,
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('is_private', true);
      });
  });

  it('creates a simple private room with missing key in body', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [
          { login: 'non_existing_user_login' },
          { id: users[2].id },
        ],
        // is_private: true,-----------> // not sent for test
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('creates room with owner in participants', async () => {
    await chatHelper
      .createSimpleRoom({
        participants: [{ login: loggedUser.login }, { id: users[2].id }],
        is_private: true,
      })
      .then(async (resp) => {
        expect(resp.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getAllRooms();
      })
      .then((resp) => {
        const participants: Participant[] = resp.body[0].participants;
        expect(participants).toBeDefined();
        expect(participants.length).toEqual(2);
        const owner = participants.filter(
          (p) => p.user.id === loggedUser.id && p.is_owner === true,
        );
        expect(owner.length).toBe(1);
      });
  });

  it('creates room with 3 times the same user', async () => {
    const createdParticipants = [
      { id: users[1].id },
      { id: users[2].id },
      { id: users[2].id },
      { id: users[2].id }, // <<<<< same user twice
    ];

    await chatHelper
      .createSimpleRoom({
        participants: createdParticipants,
        is_private: true,
      })
      .then(async (resp) => {
        expect(resp.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getAllRooms();
      })
      .then((resp) => {
        const participants: Participant[] = resp.body[0].participants;
        expect(participants).toBeDefined();
        expect(participants.length).toEqual(createdParticipants.length - 2 + 1);
        // - 2 for 2 extra inserts +1 for owner added to participants
        const owner = participants.filter(
          (p) => p.user.id === loggedUser.id && p.is_owner === true,
        );
        expect(owner.length).toBe(1);
      });
  });

  it('creates many random rooms', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        return await chatHelper.getAllRooms();
      })
      .then((response) => {
        const returnedRooms = response.body as RoomDto[];
        expect(returnedRooms.length).toEqual(createdRooms.length);
        returnedRooms.forEach((returnedRoom) => {
          const roomIndex = createdRooms.findIndex((item) => {
            return item.id === returnedRoom.id;
          });
          expect(roomIndex).not.toBe(-1);
          const room = createdRooms[roomIndex];

          const expectedLen = room.participants.some(
            (p) => p.id === room.owner_created.id,
          )
            ? room.participants.length
            : room.participants.length + 1;
          expect(returnedRoom.participants.length).toBe(expectedLen);
          returnedRoom.participants.forEach((participant) => {
            expect(
              room.participants.some((p) => p.id === participant.id),
            ).not.toBe(-1);
          });
        });
      });
  });

  it('creates many random rooms and get user\'s rooms list on /me/rooms', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRooms: RoomDto[] = response.body;
        const expectedRooms: RandomRoom[] = createdRooms.filter(
          (room: RandomRoom) => {
            return (
              room.participants.some((p) => p.id === loggedUser.id) ||
              room.owner_created.id === loggedUser.id
            );
          },
        );
        expect(returnedRooms.length).toBe(expectedRooms.length);
      });
  });


}); // <<< end of describBlock
