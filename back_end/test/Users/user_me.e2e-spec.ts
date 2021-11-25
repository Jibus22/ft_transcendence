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

  it('GET /me after logging', async () => {
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

  it('GET /me after logging and using corrupted cookie', async () => {
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

  it('GET /me after logging and without cookie', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));

    expect(cookies.length).toBeGreaterThanOrEqual(1);
    await request(app.getHttpServer()).get('/me').expect(HttpStatus.FORBIDDEN);
  });

  it('GET /me with a cookie after logging and delete user', async () => {
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

  it('GET /me login with non existing user', async () => {
    await commons.createFakeUsers();
    const cookies = await commons
      .logUser('no_use_with_this_login')
      .then((response) => commons.getCookies(response));
    expect(cookies).toBeUndefined();
  });

  it('PATCH /me with login', async () => {
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

  it('PATCH /me with use_photo_url boolean to false', async () => {
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
