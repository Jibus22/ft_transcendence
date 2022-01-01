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

describe('chat controller: chat rooms routes (e2e)', () => {
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

  it('creates a simple private room photo_url field', async () => {
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

  /*
  ===================================================================
  -------------------------------------------------------------------
  Get PUBLIC All Rooms
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates random rooms and get only public rooms', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        const returnedRooms: RoomDto[] = response.body;
        const expectedRooms: RandomRoom[] = createdRooms.filter(
          (room: RandomRoom) => {
            return room.is_private === false;
          },
        );
        expect(returnedRooms.length).toBe(expectedRooms.length);
        const privateRooms = returnedRooms.filter((r) => r.is_private === true);
        expect(privateRooms.length).toBe(0);
      });
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
  Get All Rooms
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a few rooms and get list of them', async () => {
    const rooms = [
      {
        participants: [{ login: users[1].login }, { id: users[2].id }],
        is_private: true,
      },
      {
        participants: [{ login: users[2].login }, { id: users[2].id }],
        is_private: false,
      },
      {
        participants: [{ id: users[4].id }],
        password: 'testPassword',
        is_private: false,
      },
      {
        participants: users,
        password: null,
        is_private: false,
      },
    ];

    for (let i = 0; i < rooms.length; i++) {
      await chatHelper.createSimpleRoom(rooms[i]);
    }

    await chatHelper.getAllRooms().then((response) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(typeof response.body).toBe('object');
      expect(response.body.length).toBe(rooms.length);
      response.body.forEach((element, index) => {
        expect(element).toHaveProperty(
          'is_password_protected',
          rooms[index].password ? true : false,
        );
        expect(typeof element.is_password_protected).toBe('boolean');
        expect(element).toHaveProperty('is_private', rooms[index].is_private);
        const owner = element.participants.filter(
          (p) => p.user.id === loggedUser.id && p.is_owner === true,
        );
        expect(owner.length).toBe(1);
      });
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
      .generateManyRandomRooms(nbOfRooms)
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

  it("creates many random rooms and get user's rooms list on /me/rooms", async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
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

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates random rooms and post a message to a room owned by user, and fetch it', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();
    let destRoom: RandomRoom;

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        destRoom = createdRooms.find(
          (r) => r.owner_created.id === loggedUser.id,
        );
        return await chatHelper.postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('sender.id', loggedUser.id);
        expect(response.body).toHaveProperty('body', testMessage);
        expect(response.body).toHaveProperty('timestamp');
        return await chatHelper.getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const messages: ChatMessageDto[] = response.body;
        expect(messages).toHaveLength(1);
        expect(messages[0]).toHaveProperty('body', testMessage);
        expect(messages[0]).toHaveProperty('sender.id', loggedUser.id);
        expect(messages[0]).toHaveProperty('timestamp');
      });
  });

  it('creates a room and post MANY messages, and fetch them', async () => {
    let createdRoom: RoomDto;

    const randomMessages: createMessageDto[] = [];
    while (randomMessages.length < 100) {
      randomMessages.push({ body: faker.lorem.text() as string });
    }
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        await Promise.all(
          randomMessages.map(async (message) => {
            await chatHelper
              .postMessages(cookies, createdRoom.id, message)
              .then(async (response) => {
                expect(response.status).toBe(HttpStatus.CREATED);
                expect(response.body).toHaveProperty('body', message.body);
                expect(response.body).toHaveProperty(
                  'sender.id',
                  loggedUser.id,
                );
                expect(response.body).toHaveProperty('timestamp');
              });
          }),
        );

        return await chatHelper.getRoomMessages(cookies, createdRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const returnedMessages: ChatMessageDto[] = response.body;
        expect(returnedMessages).toHaveLength(randomMessages.length);
        returnedMessages.map((message, index) => {
          expect(message).toHaveProperty('body', randomMessages[index].body);
        });
      });
  });

  it('creates random rooms and try to POST message to a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const destRoom = createdRooms.find(
          (r) =>
            r.owner_created.id !== loggedUser.id &&
            !r.participants.some((p) => p.id === loggedUser.id),
        );
        return await chatHelper.postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('creates random rooms and try to GET message a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const destRoom = createdRooms.find(
          (r) =>
            r.owner_created.id !== loggedUser.id &&
            !r.participants.some((p) => p.id === loggedUser.id),
        );
        return await chatHelper.getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
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

  it('creates random rooms and join a public room', async () => {
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

  it('creates random rooms and join password protected rooms with WRONG password ', async () => {
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

  it('creates random rooms and leave some', async () => {
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

  it('creates random rooms and leave rooms which user is NOT participant', async () => {
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

  it('creates random rooms and leave rooms which user is OWNER', async () => {
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

  /*
  ===================================================================
  -------------------------------------------------------------------
        MODERATORS MANAGEMENT
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a room and change participants to moderator then back to regulat participant', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, returnedRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('is_moderator', true);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { id: roomId, participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(true);
        return await chatHelper.updateModerators(cookies, roomId, {
          participant_id: targetParticipant.id,
          is_moderator: false,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('is_moderator', false);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(false);
      });
  });

  it('creates a room try to change non existing participant', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, returnedRoom.id, {
          participant_id: targetParticipant.id + 'nonexisting',
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('creates a room try to change participant with wrong room_id', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(
          cookies,
          returnedRoom.id + 'nonexisting',
          {
            participant_id: targetParticipant.id,
            is_moderator: true,
          },
        );
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('creates many random rooms and try to change participant in room not owned', async () => {
    let targetParticipant: ParticipantDto;

    await chatHelper
      .generateManyRandomRooms(nbOfRooms)
      .then(async (response) => {
        expect(response.length).toBe(nbOfRooms);
        return await chatHelper.getParticipatingNotOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms.length).not.toBe(0);

        const targetParticipant = rooms[0].participants.find(
          (p) => p.is_moderator === false,
        );

        return await chatHelper.updateModerators(
          cookies,
          targetParticipant.id,
          {
            participant_id: targetParticipant.id,
            is_moderator: true,
          },
        );
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('creates a room, log as non owner and try change participants to moderator', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);

        const tmpCookies = await commons
          .logUser(users[2].login)
          .then((r) => commons.getCookies(r));

        return await chatHelper.updateModerators(tmpCookies, returnedRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(false);
      });
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        RESTRICTIONS
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a room and ban a user ', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.addRestriction(cookies, returnedRoom.id, {
          user_id: targetParticipant.user.id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        const bannedParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(bannedParticipant).toBeUndefined();
        return await chatHelper.getAllRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(0);
        expect(room.bans.length).toBe(1);
        expect(room.bans[0].id).toBe(targetParticipant.user.id);
      });
  });

  it('creates a room and mute a user ', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.addRestriction(cookies, returnedRoom.id, {
          user_id: targetParticipant.user.id,
          restriction_type: 'mute',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        const mutedParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(mutedParticipant).toEqual(targetParticipant);
        return await chatHelper.getAllRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.bans.length).toBe(0);
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(1);
        expect(room.mutes[0].id).toBe(targetParticipant.user.id);
      });
  });

  it('creates a room, log as non moderator and try to mute/ban user', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;
    let tmpCookies: string[];

    await chatHelper
      .createSimpleRoom(room)
      .then(async () => {
        return await commons.logUser(users[2].login);
      })
      .then(async (response) => {
        tmpCookies = commons.getCookies(response);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom: RoomDto = response.body[0];
        return await chatHelper.addRestriction(tmpCookies, returnedRoom.id, {
          user_id: users[1].id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        return await chatHelper.getAllRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.bans.length).toBe(0);
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(0);
      });
  });

  it('creates a room and change participants to moderator, log under it, try to ban owner', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;
    let targetRoom: RoomDto;
    let tmpCookies: string[];

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        targetRoom = response.body[0] as RoomDto;
        expect(targetRoom.participants.length).toBe(3);
        targetParticipant = targetRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, targetRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        await commons
          .logUser(targetParticipant.user.login)
          .then((r) => (tmpCookies = commons.getCookies(r)));
        return await chatHelper.addRestriction(tmpCookies, targetRoom.id, {
          user_id: loggedUser.id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toHaveProperty(
          'error',
          'owner of the room cannot be banned',
        );
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        expect(participants.length).toBe(3);
      });
  });
}); // <<< end of describBlock
