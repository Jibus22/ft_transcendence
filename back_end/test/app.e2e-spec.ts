import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CommonTest } from './helpers';

describe('user controller: users basic features (e2e)', () => {
  let app: INestApplication;
  let commons: CommonTest;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);
    await app.init();
  });


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
    await commons.createFakeUsers().then((resp) => {
      for (const user in commons.testUserBatch) {
        expect(resp.body[user].login).toEqual(
          commons.testUserBatch[user].login,
        );
        expect(resp.body[user].photo_url).toEqual(
          commons.testUserBatch[user].photo_url_local === null
            ? commons.testUserBatch[user].photo_url_42
            : commons.testUserBatch[user].photo_url_local,
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
});
