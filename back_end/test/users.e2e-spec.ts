import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isEthereumAddress } from 'class-validator';
import { response } from 'express';
import { exit } from 'process';
import { TestScheduler } from 'rxjs/testing';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        AUXILIARY FUNCTIONS
  -------------------------------------------------------------------
  ===================================================================
  */

  const testUserBatch = [
    {
      login: 'fake-vgoldman-custome',
      login_42: 'fake-vgoldman',
      photo_url_42: 'https://cdn.intra.42.fr/users/vgoldman.jpg',
      photo_url_local: null,
      use_local_photo: false,
    },
    {
      login: 'fake-frfrancd-custome',
      login_42: 'fake-frfrancd',
      photo_url_42: 'https://cdn.intra.42.fr/users/frfrancd.jpg',
      photo_url_local: null,
      use_local_photo: false,
    },
    {
      login: 'fake-jle-corr-custome',
      login_42: 'fake-jle-corr',
      photo_url_42: 'https://cdn.intra.42.fr/users/jle-corr.jpg',
      photo_url_local: null,
      use_local_photo: false,
    },
    {
      login: 'fake-mrouchy-custome',
      login_42: 'fake-mrouchy',
      photo_url_42: 'https://cdn.intra.42.fr/users/mrouchy.jpg',
      photo_url_local: null,
      use_local_photo: false,
    },
    {
      login: 'fake-randomDude-custome',
      login_42: 'fake-randomDude',
      photo_url_42: 'https://cdn.intra.42.fr/users/medium_default.png',
      photo_url_local: null,
      use_local_photo: true,
    },
    {
      login: 'fake-user-custome',
      login_42: 'fake-user',
      photo_url_42: 'https://cdn.intra.42.fr/users/medium_default.png',
      photo_url_local: 'https://localhost:3000/users/photos/user.png',
      use_local_photo: true,
    },
  ];

  async function loginUser(login: string) {
    return await request(app.getHttpServer()).post('/dev/signin').send({
      login,
    });
  }

  function getCookies(response: request.Response): string[] {
    return response.get('Set-Cookie');
  }

  async function populateFakeUsers() {
    return await request(app.getHttpServer())
      .post('/dev/createUserBatch')
      .send(testUserBatch);
  }

  async function deleteFakeUsers(users: { login: string }[]) {
    return await request(app.getHttpServer())
      .delete('/dev/deleteUserBatch')
      .send(users);
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        All routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('/api_status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api_status')
      .expect(200)
      .expect('online');
  });

  it('[DEV FEATURES 🚧 ]checks if db can take our test user in', async () => {
    await populateFakeUsers().then((resp) => {
      for (const user in testUserBatch) {
        expect(resp.body[user].login).toEqual(testUserBatch[user].login);
        expect(resp.body[user].photo_url).toEqual(
          testUserBatch[user].photo_url_local === null
            ? testUserBatch[user].photo_url_42
            : testUserBatch[user].photo_url_local,
        );
      }
    });
  });

  it('tries all cookie protected routes without cookie', async () => {
    const serv = app.getHttpServer();
    await request(serv).get('/me').expect(HttpStatus.FORBIDDEN);
    await request(serv).patch('/me').expect(HttpStatus.FORBIDDEN);

    await request(serv).get('/users').expect(HttpStatus.FORBIDDEN);
    await request(serv)
      .get('/users/id/test_fake_user_id')
      .expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).post('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).delete('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/users/block').expect(HttpStatus.FORBIDDEN);
    await request(serv).post('/users/block').expect(HttpStatus.FORBIDDEN);
    await request(serv).delete('/users/block').expect(HttpStatus.FORBIDDEN);

    /*     ---- UNPROTECTED ROUTES
    await request(app.getHttpServer()).get('/auth/callback').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/auth/signout').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).post('/dev/signin').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).post('/dev/createUserBatch').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/dev/deleteUserBatch').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/dev/deleteAllUsers').expect(HttpStatus.FORBIDDEN);
    */
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        /me routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('GET /me after logging', async () => {
    await populateFakeUsers();
    const cookies = await loginUser(testUserBatch[0].login).then((response) =>
      getCookies(response),
    );
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('login');
      });
  });

  it('GET /me after logging and using corrupted cookie', async () => {
    await populateFakeUsers();
    const cookies = await loginUser(testUserBatch[0].login).then((response) =>
      getCookies(response),
    );

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    cookies[0] = cookies[0].replace('sess=', 'sess=42');
    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('GET /me after logging and without cookie', async () => {
    await populateFakeUsers();
    const cookies = await loginUser(testUserBatch[0].login).then((response) =>
      getCookies(response),
    );

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  });

  it('GET /me with a cookie after logging and delete user', async () => {
    await populateFakeUsers();
    const cookies = await loginUser(testUserBatch[0].login).then((response) =>
      getCookies(response),
    );

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await deleteFakeUsers([
      {
        login: testUserBatch[0].login,
      },
    ]);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  });

  it('GET /me login with non existing user', async () => {
    await populateFakeUsers();
    const cookies = await loginUser('no_use_with_this_login').then((response) =>
      getCookies(response),
    );
    expect(cookies).toBeUndefined();
  });

  it('PATCH /me with login', async () => {
    let cookies;

    await populateFakeUsers()
      .then(async () => await loginUser(testUserBatch[0].login))
      .then((response) => {
        cookies = getCookies(response);
      })
      .then(
        async () =>
          await request(app.getHttpServer())
            .patch('/me')
            .set('Cookie', cookies)
            .send({
              login: testUserBatch[0].login + '42',
            }),
      )
      .then((response) => expect(response.status).toBe(HttpStatus.OK))
      .then(
        async () =>
          await request(app.getHttpServer()).get('/me').set('Cookie', cookies),
      )
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(testUserBatch[0].login + 42);
        expect(response.body.photo_url).toEqual(testUserBatch[0].photo_url_42);
      })

      .catch((error) => {
        throw error;
      });
  });

  it('PATCH /me with use_photo_url boolean to false', async () => {
    let cookies;

    await populateFakeUsers()
      .then(async () => await loginUser(testUserBatch[0].login))
      .then((response) => {
        cookies = getCookies(response);
      })
      .then(
        async () =>
          await request(app.getHttpServer())
            .patch('/me')
            .set('Cookie', cookies)
            .send({
              use_local_photo: false,
            }),
      )
      .then((response) => expect(response.status).toBe(HttpStatus.OK))
      .then(
        async () =>
          await request(app.getHttpServer()).get('/me').set('Cookie', cookies),
      )
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(testUserBatch[0].login);
        // no local photo is uploaded so it should still return 42 url
        expect(response.body.photo_url).toEqual(testUserBatch[0].photo_url_42);
      })
      .catch((error) => {
        throw error;
      });
  });

  /*
    ===================================================================
    -------------------------------------------------------------------
          Upload local photo
            TODO:
              - add route for photo upload
              - test upload files
              - test switch use_local_photo boolean
    -------------------------------------------------------------------
    ===================================================================
    */

  /*
    ===================================================================
    -------------------------------------------------------------------
          test /users/id
    -------------------------------------------------------------------
    ===================================================================
    */

  it('GET /users/id/:user_id', async () => {
    const users = await populateFakeUsers().then((response) => response.body);

    const cookies = await loginUser(testUserBatch[0].login).then((response) =>
      getCookies(response),
    );
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < users.length; i++) {
      await request(app.getHttpServer())
        .get('/users/id/' + users[i].login)
        .set('Cookie', cookies)
        .then((resp) => {
          expect(resp.body).toHaveProperty('id');
          expect(resp.body).toHaveProperty('login');
          expect(resp.body).toHaveProperty('photo_url');
          expect(resp.body).not.toHaveProperty('photo_url_42');
          expect(resp.body).not.toHaveProperty('photo_url_local');
          expect(resp.body).not.toHaveProperty('use_local_photo');
          expect(resp.body).not.toHaveProperty('friends_list');
          expect(resp.body).not.toHaveProperty('blocked_list');
        });
    }
  });

  /*
    ===================================================================
    -------------------------------------------------------------------
          test /friends
    -------------------------------------------------------------------
    ===================================================================
    */

  /*
  it('', async () => {
  });

  */
});
