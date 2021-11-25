import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestScheduler } from 'rxjs/testing';
import * as request from 'supertest';
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
      use_local_photo: false,
    }
  ];

  async function logginTestUser() {
    let cookies: string[];

    await populateFakeUsers()
      .catch((error) => {
        throw error;
      });

    await request(app.getHttpServer())
      .post('/dev/signin')
      .send({
        login: testUserBatch[0].login
      })
      .then((resp) => {
        cookies = resp.get('Set-Cookie');
      });

    return cookies;
  }

  async function populateFakeUsers() {
    return await request(app.getHttpServer())
      .post('/dev/createUserBatch')
      .send(testUserBatch);
  }

  async function deleteFakeUsers(users: {login: string}[] ) {
    return await request(app.getHttpServer())
      .delete('/dev/deleteUserBatch')
      .send(users);
  }


  /*
  ===================================================================
  -------------------------------------------------------------------
        USER tests
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
      for(const user in testUserBatch) {
        console.log(resp.body[user]);
        expect(resp.body[user].login).toEqual(testUserBatch[user].login);
        expect(resp.body[user].photo_url).toEqual(testUserBatch[user].photo_url_42);
      }
    });
  });

  it('tries all cookie protected routes without cookie', async () => {
    const serv = app.getHttpServer();
    await request(serv).get('/users').expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/users/test').expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).post('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).delete('/users/friends').expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/users/block').expect(HttpStatus.FORBIDDEN);
    await request(serv).post('/users/block').expect(HttpStatus.FORBIDDEN);
    await request(serv).delete('/users/block').expect(HttpStatus.FORBIDDEN);
    await request(serv).get('/me').expect(HttpStatus.FORBIDDEN);
    await request(serv).patch('/me').expect(HttpStatus.FORBIDDEN);

    /*     ---- UNPROTECTED ROUTES
    await request(app.getHttpServer()).get('/auth/callback').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/auth/signout').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).post('/dev/signin').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).post('/dev/createUserBatch').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/dev/deleteUserBatch').expect(HttpStatus.FORBIDDEN);
    await request(app.getHttpServer()).delete('/dev/deleteAllUsers').expect(HttpStatus.FORBIDDEN);
    */
  });

  it('GET /me after logging', async () => {
    const cookies = await logginTestUser();
    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        console.log(resp.body);
        expect(resp.body).toHaveProperty('login');
      });

  });

  // it('GET /me after logging and using corrupted cookie', async () => {
  //   const cookies = await logginTestUser();
  //   expect(cookies.length).toBeGreaterThanOrEqual(1);
  //   cookies[0] = cookies[0].replace('sess=', 'sess=42');
  //   await request(app.getHttpServer())
  //     .get('/me')
  //     .set('Cookie', cookies)
  //     .expect(HttpStatus.FORBIDDEN);
  // });

  // it('GET /me after logging and without cookie', async () => {
  //   const cookies = await logginTestUser();
  //   expect(cookies.length).toBeGreaterThanOrEqual(1);
  //   await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  // });

  // it('GET /me with a cookie after logging and deleted user', async () => {
  //   const cookies = await logginTestUser();
  //   expect(cookies.length).toBeGreaterThanOrEqual(1);
  //   await deleteFakeUsers([
  //     {
  //       login: testUser.login
  //     }
  //   ])
  //    await request(app.getHttpServer())
  //     .get('/me')
  //     .expect(HttpStatus.FORBIDDEN);
  // });

  /*
  it('', async () => {
  });

  */
});
