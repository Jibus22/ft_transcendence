import { HttpStatus, INestApplication } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';

describe('user controller: users infos routes (e2e)', () => {
  let app: INestApplication;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser;

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
      .catch((error) => {});
    expect(users.length).toEqual(commons.testUserBatch.length);

    cookies = await commons
      .logUser(loggedUser.login)
      .then((response) => commons.getCookies(response));
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
      .get('/room')
      .set('Cookie', cookies);
  }

  async function getUserRooms() {
    return await request(app.getHttpServer())
      .get('/me/rooms')
      .set('Cookie', cookies);
  }

  async function generateOneRandomRoom(tmpCookie: string[]) {
    const body = {
      participants: users.map((value) => {
        return Math.random() < 0.2 ? { id: value.id } : '';
      }),
      is_private: Math.random() < 0.5,
      password: Math.random() < 0.3 ? 'fake_password' : '',
    };

    console.log(body);
    return await request(app.getHttpServer())
      .post('/room')
      .set('Cookie', tmpCookie)
      .send(body);
  }

  async function generateManyRandomRooms(nbOfRooms: number) {
    for (let i = 0; i < nbOfRooms; i++) {
      const ran = Math.floor((Math.random() * 100) % users.length);
      const tmpCookie = await commons
        .logUser(commons.testUserBatch[ran].login)
        .then((response) => commons.getCookies(response));

      await generateOneRandomRoom(tmpCookie);
    }
    return await getAllRooms();
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
      expect(response.body[0].participants).toHaveLength(0);
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
      // is_private: true,  // not sent for test
    }).then((response) => {
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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
      });
    });
  });

  it('creates many random rooms', async () => {
    const nbOfRooms = 2;
    await generateManyRandomRooms(nbOfRooms)
    .then((resp) => {
      expect(resp.body.length).toEqual(nbOfRooms);
      console.log(JSON.stringify(resp.body, null, 4));
    });
  });

  it('creates many random rooms and get user\'s rooms', async () => {
    const nbOfRooms = 2;
    await generateManyRandomRooms(nbOfRooms)
    .then((resp) => {
      expect(resp.body.length).toEqual(nbOfRooms);
      console.log(JSON.stringify(resp.body, null, 4));
    })
    .then(async () => {
      return await getUserRooms();
    })
    .then((response) => {
      console.log(response.body);
    });
  });
});
