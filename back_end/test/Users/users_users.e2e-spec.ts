import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { CommonTest } from '../helpers';

describe('user controller: users infos routes (e2e)', () => {
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
          /users/*
    -------------------------------------------------------------------
    ===================================================================
   */

  it('GET /users/id/:user_id', async () => {
    const users = await commons
      .createFakeUsers()
      .then((response) => response.body);

    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
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

  it('GET /users/id/:user_id with non existing user', async () => {
    const users = await commons
      .createFakeUsers()
      .then((response) => response.body);

    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < users.length; i++) {
      await request(app.getHttpServer())
        .get('/users/id/' + users[i].login + '42_non_existing_user_login')
        .set('Cookie', cookies)
        .then((resp) => {
          expect(resp.status).toEqual(HttpStatus.NOT_FOUND);
          expect(resp.body).toHaveProperty('message', 'user not found');
        });
    }
  });
});
