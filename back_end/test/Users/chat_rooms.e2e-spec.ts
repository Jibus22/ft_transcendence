import { HttpStatus, INestApplication } from '@nestjs/common';
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

  /*
    ===================================================================
    -------------------------------------------------------------------
          /users/*
    -------------------------------------------------------------------
    ===================================================================
   */

  it('creates a simple private room with participants', async () => {
    await request(app.getHttpServer())
      .post('/room')
      .set('Cookie', cookies)
      .send({
        participants: [{ login: users[1].login }, { id: users[2].id }],
        is_private: true,
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });
});
