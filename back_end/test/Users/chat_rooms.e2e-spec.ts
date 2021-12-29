import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { Participant } from '../../src/modules/chat/entities/participant.entity';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
var faker = require('faker');

describe('chat controller: chat rooms routes (e2e)', () => {
  const nbOfRooms = 50;
  let app: INestApplication;
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
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        Auxiliary functions
  -------------------------------------------------------------------
  ===================================================================
  */

  async function createSimpleRoom(bodyRequest) {
    return await request(app.getHttpServer())
      .post('/room')
      .set('Cookie', cookies)
      .send(bodyRequest);
  }

  async function getAllRooms() {
    return await request(app.getHttpServer())
      .get('/room/all')
      .set('Cookie', cookies);
  }

  async function joinRoom(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: { password: string },
  ) {
    return await request(app.getHttpServer())
      .patch(`/me/rooms/${room_id}`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async function getRoomMessages(tmpCookies: string[], room_id: string) {
    return await request(app.getHttpServer())
      .get(`/room/${room_id}/message`)
      .set('Cookie', tmpCookies);
  }

  async function postMessages(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: Object,
  ) {
    return await request(app.getHttpServer())
      .post(`/room/${room_id}/message`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async function getUserRooms() {
    return await request(app.getHttpServer())
      .get('/me/rooms')
      .set('Cookie', cookies);
  }

  async function getPublicRooms() {
    return await request(app.getHttpServer())
      .get('/room/publics')
      .set('Cookie', cookies);
  }

  class CreatedParticipant {
    id: string;
  }

  class RandomRoom {
    id: string;
    owner_created: CreatedParticipant;
    participants: CreatedParticipant[];
    is_private: boolean;
    password: string;
  }

  function makeOneRandomRoom(): RandomRoom {
    let participants: CreatedParticipant[] = [];
    users.forEach((user) => {
      if (Math.random() < 0.4) {
        participants.push({ id: user.id });
      }
    });

    return {
      id: '',
      owner_created: { id: '' },
      participants: participants,
      is_private: Math.random() < 0.5,
      password: Math.random() < 0.3 ? faker.internet.password() : '',
    };
  }

  async function generateManyRandomRooms(nbRoomTested: number) {
    let createdRooms: RandomRoom[] = [];

    for (let i = 0; i < nbRoomTested; i++) {
      const ran = Math.floor((Math.random() * 100) % users.length);
      let roomOwnerId: { id: string };
      const tmpCookie = await commons
        .logUser(commons.testUserBatch[ran].login)
        .then((response) => {
          roomOwnerId = { id: response.body.id };
          return commons.getCookies(response);
        });

      const randomRoom = makeOneRandomRoom();
      randomRoom.owner_created.id = roomOwnerId.id;

      await request(app.getHttpServer())
        .post('/room')
        .set('Cookie', tmpCookie)
        .send(randomRoom)
        .then((resp) => {
          expect(resp.status).toBe(HttpStatus.CREATED);
          expect(resp.body.is_private).toBeDefined();
          expect(resp.body.is_password_protected).toBeDefined();
          expect(resp.body.id).toBeDefined();
          randomRoom.id = resp.body.id;
        });
      createdRooms.push(randomRoom);
    }
    return createdRooms;
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        Room creation
  -------------------------------------------------------------------
  ===================================================================
  */

  it('creates a simple private room with participants', async () => {
    await createSimpleRoom({
      participants: [{ login: users[1].login }, { id: users[2].id }],
      is_private: true,
    }).then((response) => {
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('is_private', true);
    });
  });

  it('creates a simple private room photo_url field', async () => {
    await createSimpleRoom({
      participants: [{ photo_url: users[5].photo_url_42 }],
      is_private: true,
    }).then((response) => {
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('is_private', true);
    });

    await getAllRooms().then((response) => {
      expect(response.body[0].participants).toHaveLength(1);
    });
  });

  it('creates a simple private room with non existing participants', async () => {
    await createSimpleRoom({
      participants: [{ login: 'non_existing_user_login' }, { id: users[2].id }],
      is_private: true,
    }).then((response) => {
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('is_private', true);
    });
  });

  it('creates a simple private room with some invalid key in body', async () => {
    await createSimpleRoom({
      participants: [{ login: 'non_existing_user_login' }, { id: users[2].id }],
      some_key: true,
      is_private: true,
    }).then((response) => {
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('is_private', true);
    });
  });

  it('creates a simple private room with missing key in body', async () => {
    await createSimpleRoom({
      participants: [{ login: 'non_existing_user_login' }, { id: users[2].id }],
      // is_private: true,-----------> // not sent for test
    }).then((response) => {
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

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await getPublicRooms();
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
      await createSimpleRoom(rooms[i]);
    }

    await getAllRooms().then((response) => {
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
    await createSimpleRoom({
      participants: [{ login: loggedUser.login }, { id: users[2].id }],
      is_private: true,
    })
      .then(async (resp) => {
        expect(resp.status).toBe(HttpStatus.CREATED);
        return await getAllRooms();
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

    await createSimpleRoom({
      participants: createdParticipants,
      is_private: true,
    })
      .then(async (resp) => {
        expect(resp.status).toBe(HttpStatus.CREATED);
        return await getAllRooms();
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

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        return await getAllRooms();
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

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await getUserRooms();
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

  it('creates random rooms and post a message a room owned and fetch it', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();
    let destRoom: RandomRoom;

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        destRoom = createdRooms.find(
          (r) => r.owner_created.id === loggedUser.id,
        );
        return await postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('body', testMessage);
        expect(response.body).toHaveProperty('sender.id', loggedUser.id);
        expect(response.body).toHaveProperty('body', testMessage);
        expect(response.body).toHaveProperty('timestamp');
        return await getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.messages).toHaveLength(1);
        expect(response.body).toHaveProperty('messages[0].body', testMessage);
        expect(response.body).toHaveProperty(
          'messages[0].sender.id',
          loggedUser.id,
        );
        expect(response.body).toHaveProperty('messages[0].timestamp');
      });
  });

  it('creates random rooms and try to POST message to a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await generateManyRandomRooms(nbOfRooms)
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
        return await postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('creates random rooms and try to GET message a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await generateManyRandomRooms(nbOfRooms)
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
        return await getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        JOIN / LEAVE ROOMS
  -------------------------------------------------------------------
  ===================================================================
  */

  async function joinManyRooms(
    nbOfJoins: number,
    publicRooms: RoomDto[],
    createdRooms: RandomRoom[],
  ) {
    let userRoomsLen = await (
      await getUserRooms().then((r) => r.body as RoomDto[])
    ).length;

    for (let i = 0; i < nbOfJoins && publicRooms.length > 0; i++) {
      const targetRoom = publicRooms.at(publicRooms.length - 1);
      const originalRoom = createdRooms.find((cr) => cr.id === targetRoom.id);
      await joinRoom(cookies, targetRoom.id, {
        password: originalRoom.password,
      }).then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
      publicRooms.pop();
      const index = createdRooms.indexOf(originalRoom);
      createdRooms.slice(index, index);

      const newUserRoomsLen = (
        await getUserRooms().then((r) => r.body as RoomDto[])
      ).length;
      expect(newUserRoomsLen).toBe(userRoomsLen + 1);
      userRoomsLen = newUserRoomsLen;
    }
  }

  it('creates random rooms and join a public room', async () => {
    let createdRooms: RandomRoom[];

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await getPublicRooms();
      })
      .then(async (response) => {
        const unjoindedPublicRooms = (response.body as RoomDto[]).filter(
          (r) => !r.participants.some((p) => p.user.id === loggedUser.id),
        );
        expect(unjoindedPublicRooms.length).not.toBe(0);

        await joinManyRooms(
          unjoindedPublicRooms.length,
          unjoindedPublicRooms,
          createdRooms,
        );
      });
  });

  async function leaveManyRooms(
    nbOfJoins: number,
    publicRooms: RoomDto[],
    createdRooms: RandomRoom[],
  ) {
    // let userRoomsLen = await (
    //   await getUserRooms().then((r) => r.body as RoomDto[])
    // ).length;
    // for (let i = 0; i < nbOfJoins && publicRooms.length > 0; i++) {
    //   const targetRoom = publicRooms.at(publicRooms.length - 1);
    //   const originalRoom = createdRooms.find(
    //     (cr) => cr.id === targetRoom.id,
    //   );
    //   await leaveRoom(cookies, targetRoom.id, {password: originalRoom.password})
    //     .then((response) => {
    //       expect(response.status).toBe(HttpStatus.OK);
    //     });
    //   publicRooms.pop();
    //   const index = createdRooms.indexOf(originalRoom)
    //   createdRooms.slice(index, index);
    //   const newUserRoomsLen = (
    //     await getUserRooms().then((r) => r.body as RoomDto[])
    //   ).length;
    //   expect(newUserRoomsLen).toBe(userRoomsLen + 1);
    //   userRoomsLen = newUserRoomsLen;
    // }
  }

  it('creates random rooms and leave some', async () => {
    let createdRooms: RandomRoom[];

    await generateManyRandomRooms(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await getUserRooms();
      })
      .then(async (response) => {
        const joinedRooms = (response.body as RoomDto[]).filter((r) =>
          r.participants.some(
            (p) => p.user.id === loggedUser.id && p.is_owner === false,
          ),
        );
        expect(joinedRooms.length).not.toBe(0);

        await leaveManyRooms(joinedRooms.length, joinedRooms, createdRooms);
      });
  });
}); // <<< end of describBlock
