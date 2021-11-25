import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CommonTest } from '../helpers';

describe('user controller: users relations routes (e2e)', () => {
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
          test /friends
    -------------------------------------------------------------------
    ===================================================================
    */

  it('GET + POST + DELETE /users/friends', async () => {
    const users = await commons
      .createFakeUsers()
      .then((response) => response.body);

    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('friends_list');
        expect(resp.body.friends_list).toHaveLength(0);
      })
      .then(
        async (resp) =>
          await request(app.getHttpServer())
            .post('/users/friends')
            .set('Cookie', cookies)
            .send({
              id: users[1].id,
            }),
      )
      .then(async (resp) => {
        expect(resp.status).toEqual(HttpStatus.CREATED);
        return await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies);
      })
      .then(async (resp) => {
        expect(resp.body).toHaveProperty('friends_list');
        expect(resp.body.friends_list).toHaveLength(1);
        return await request(app.getHttpServer())
          .delete('/users/friends')
          .set('Cookie', cookies)
          .send({
            id: users[1].id,
          });
      })
      .then(async (resp) => {
        expect(resp.status).toEqual(HttpStatus.OK);
        return await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies);
      })
      .then(async (resp) => {
        expect(resp.body).toHaveProperty('friends_list');
        expect(resp.body.friends_list).toHaveLength(0);
      });
  });

  it('tries to add oneself to friends list and fails', async () => {
    const users = await commons
      .createFakeUsers()
      .then((response) => response.body);

    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('friends_list');
        expect(resp.body.friends_list).toHaveLength(0);
      })
      .then(
        async (resp) =>
          await request(app.getHttpServer())
            .post('/users/friends')
            .set('Cookie', cookies)
            .send({
              id: users[0].id,
            }),
      )
      .then(async (resp) => {
        expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
        return await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies);
      })
      .then(async (resp) => {
        expect(resp.body).toHaveProperty('friends_list');
        expect(resp.body.friends_list).toHaveLength(0);
      });
  });

  /*
    ===================================================================
    -------------------------------------------------------------------
          test /blocked
    -------------------------------------------------------------------
    ===================================================================
    */

  it('GET + POST + DELETE /users/friends', async () => {
    const users = await commons
      .createFakeUsers()
      .then((response) => response.body);

    const cookies = await commons
      .logUser(commons.testUserBatch[0].login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('blocked_list');
        expect(resp.body.blocked_list).toHaveLength(0);
      })
      .then(
        async (resp) =>
          await request(app.getHttpServer())
            .post('/users/block')
            .set('Cookie', cookies)
            .send({
              id: users[1].id,
            }),
      )
      .then(async (resp) => {
        expect(resp.status).toEqual(HttpStatus.CREATED);
        return await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies);
      })
      .then(async (resp) => {
        expect(resp.body).toHaveProperty('blocked_list');
        expect(resp.body.blocked_list).toHaveLength(1);
        return await request(app.getHttpServer())
          .delete('/users/block')
          .set('Cookie', cookies)
          .send({
            id: users[1].id,
          });
      })
      .then(async (resp) => {
        expect(resp.status).toEqual(HttpStatus.OK);
        return await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies);
      })
      .then(async (resp) => {
        expect(resp.body).toHaveProperty('blocked_list');
        expect(resp.body.blocked_list).toHaveLength(0);
      });
  });
});
