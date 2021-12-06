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
      }
    });
  });

  it('tries all cookie protected routes without cookie', async () => {
    const serv = app.getHttpServer();
    await request(serv).get('/me').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).patch('/me').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).get('/users').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).get('/users/profile/test_fake_user_id').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).get('/users/friend').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).post('/users/friend').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).delete('/users/friend').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).get('/users/block').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).post('/users/block').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).delete('/users/block').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).post('/auth/2fa/generate').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).post('/auth/2fa/turn-off').expect(HttpStatus.UNAUTHORIZED);
    await request(serv).post('/auth/2fa/turn-on').expect(HttpStatus.UNAUTHORIZED);
    // await request(serv).post('/auth/2fa/authenticate').expect(HttpStatus.UNAUTHORIZED);
    //TODO add new routes when implemented
  });
});
