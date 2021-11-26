import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CommonTest } from '../helpers';

describe('user controller: /me routes (e2e)', () => {
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
        /me routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('gets user own infos after logging', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('login');
      });
  });

  it('tries to get user own infos after logging with corrupted cookie', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    cookies[0] = cookies[0].replace('sess=', 'sess=42');
    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('tries to get user own infos after logging without cookie', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  });

  it('tries to get user own infos after logging, with a cookie, after user was deleted', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await commons.deleteFakeUsers([
      {
        login: commons.testUserBatch[0].login,
      },
    ]);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  });

  it('tries to log with non existing user login', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser('no_use_with_this_login')
      .then((response) => commons.getCookies(response));
    expect(cookies).toBeUndefined();
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        PATCH /me routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('updates user login and check if change is made', async () => {
    let cookies: string[];

    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(commons.testUserBatch[0].login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await request(app.getHttpServer())
            .patch('/me')
            .set('Cookie', cookies)
            .send({
              login: commons.testUserBatch[0].login + '42',
            }),
      )
      .then((response) => expect(response.status).toBe(HttpStatus.OK))
      .then(
        async () =>
          await request(app.getHttpServer()).get('/me').set('Cookie', cookies),
      )
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(
          commons.testUserBatch[0].login + 42,
        );
        expect(response.body.photo_url).toEqual(
          commons.testUserBatch[0].photo_url_42,
        );
      })

      .catch((error) => {
        throw error;
      });
  });

  it('updates use_local_photo boolean', async () => {
    let cookies: string[];

    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(commons.testUserBatch[0].login))
      .then((response) => {
        cookies = commons.getCookies(response);
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
        expect(response.body.login).toEqual(commons.testUserBatch[0].login);
        // no local photo is uploaded so it should still return 42 url
        expect(response.body.photo_url).toEqual(
          commons.testUserBatch[0].photo_url_42,
        );
      })
      .catch((error) => {
        throw error;
      });
  });
});
