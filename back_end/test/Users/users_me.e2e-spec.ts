import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import path from 'path/posix';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CommonTest } from '../helpers';

describe('user controller: /me routes (e2e)', () => {
  let app: INestApplication;
  let commons: CommonTest;
  let users;
  let cookies: string[];
  let loggedUser;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);

    await app.init();

    users = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {});
    expect(users.length).toEqual(commons.testUserBatch.length);

    loggedUser = commons.testUserBatch[0];

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

  const patchMe = async (body, cookiesParam: string[]) => {
    return await request(app.getHttpServer())
      .patch('/me')
      .set('Cookie', cookiesParam)
      .send(body);
  };
  /*
  ===================================================================
  -------------------------------------------------------------------
        /me routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('gets user own infos after logging', async () => {
    await commons.getMe(cookies).then((resp) => {
      expect(resp.body).toHaveProperty('login');
      expect(resp.body.login).toEqual(loggedUser.login);
    });
  });

  it('tries to get user own infos with corrupted cookie', async () => {
    const regex = /sess=../i;
    cookies[0] = cookies[0].replace(regex, 'sess=42');
    await commons.getMe(cookies).then((resp) => {
      const newCookies = commons.getCookies(resp);
      expect(cookies).toHaveLength(2);
      expect(newCookies).toBeDefined();
      expect(newCookies.length).toBeLessThanOrEqual(1);
      expect(resp.status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  it('tries to get user own infos after logging without cookie', async () => {
    await request(app.getHttpServer())
      .get('/me')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('tries to log with non existing user login', async () => {
    await commons
      .logUser('non_existing_user')
      .then((response) => commons.getCookies(response))
      .then((tmpCookies) => expect(tmpCookies.length).toBe(0));
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        PATCH /me routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('updates user login and check if change is made', async () => {
    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(loggedUser.login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await patchMe(
            {
              login: loggedUser.login + '42',
            },
            cookies,
          ),
      )
      .then((response) => expect(response.status).toBe(HttpStatus.OK))
      .then(async () => await commons.getMe(cookies))
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(loggedUser.login + 42);
        expect(response.body.photo_url).toEqual(
          commons.testUserBatch[0].photo_url_42,
        );
      });
  });

  it('updates user login with already used login', async () => {
    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(loggedUser.login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await patchMe(
            {
              login: commons.testUserBatch[1].login,
            },
            cookies,
          ),
      )
      .then((response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('updates user with invalid value', async () => {
    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(loggedUser.login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await patchMe(
            {
              login: 42
            },
            cookies,
          ),
      )
      .then((response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('updates user invalid key', async () => {
    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(loggedUser.login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await patchMe(
            {
              invalid_key: '42',
            },
            cookies,
          ),
      )
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
      })
      .then(async () => await commons.getMe(cookies))
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(loggedUser.login);
        expect(response.body.photo_url).toEqual(
          commons.testUserBatch[0].photo_url_42,
        );
      });
  });

  it('updates use_local_photo boolean', async () => {
    await commons
      .createFakeUsers()
      .then(async () => await commons.logUser(loggedUser.login))
      .then((response) => {
        cookies = commons.getCookies(response);
      })
      .then(
        async () =>
          await patchMe(
            {
              use_local_photo: false,
            },
            cookies,
          ),
      )
      .then((response) => expect(response.status).toBe(HttpStatus.OK))
      .then(async () => await commons.getMe(cookies))
      .then((response) => {
        expect(response.body).toHaveProperty('login');
        expect(response.body.login).toEqual(loggedUser.login);
        // no local photo is uploaded so it should still return 42 url
        expect(response.body.photo_url).toEqual(
          commons.testUserBatch[0].photo_url_42,
        );
      });
  });
});
