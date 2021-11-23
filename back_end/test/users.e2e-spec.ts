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

  /* ------------------------------------------------------------------------ */
  /* Auxiliarry functions */
  /* ------------------------------------------------------------------------ */

  async function populateFakeUsers() {
    return await request(app.getHttpServer())
      .post('/dev/createUserBatch')
      .send([
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
        },
      ]);
  }

  it('/api_status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api_status')
      .expect(200)
      .expect('online');
  });

  it('[DEV FEATURES 🚧 ]checks if db can take our test user in', async () => {
    let testUser;
    await populateFakeUsers()
      .then((response) => {
      testUser = response.body[0];
      });
    return expect(testUser).toHaveProperty('login', 'fake-vgoldman-custome');
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


  //

  async function logginTestUser() {

    let cookies: string[];
    let testUser: {login: string};

    await populateFakeUsers()
    .then((response) => {
      testUser = response.body[0];
    })
    .catch((error) => {throw error;});

    await request(app.getHttpServer())
    .post('/dev/signin')
    .send({login: testUser.login })
    .then((resp) => {
      cookies = resp.get("Set-Cookie");
    });

    return cookies;
  };

  it('loggin and get cookie', async () => {

    const cookies = await logginTestUser().then((value) => value);
    await request(app.getHttpServer())
      .get('/me')
      .set("Cookie", cookies)
      .then((resp) => {
        console.log(resp.body);
        expect(resp.body).toHaveProperty('login');
      });
  });

  /*
  it('', async () => {
  });

  */
});
