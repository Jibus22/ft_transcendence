import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { repeat } from 'rxjs';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CommonTest } from '../helpers';

/*
  ===================================================================
  -------------------------------------------------------------------
        enums used to test different relations
  -------------------------------------------------------------------
  ===================================================================
  */

enum RelationType {
  friend = 0,
  block,
}

const relBodyResponse = [
  'friends_list',
  'blocked_list',
]

const relRoute = [
  'friends',
  'block',
]

const relDescription = [
  'friend',
  'blocked account',
]

/*
  ===================================================================
  -------------------------------------------------------------------
        testSet function is call at the end of the file with
        each kind of relation
  -------------------------------------------------------------------
  ===================================================================
  */

const testSet = async (relation: RelationType) => {
  describe(`user controller: users relations routes (e2e): ${relDescription[relation]} `, () => {
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

    describe(`${relDescription[relation]} list manipulation`, () => {
      let users;
      let cookies;

      beforeEach(async () => {
        users = await commons
          .createFakeUsers()
          .then((response) => response.body)
          .catch((error) => {});
        expect(users.length).toEqual(commons.testUserBatch.length);

        cookies = await commons
          .logUser(commons.testUserBatch[0].login)
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

      const addRelation = async (reqBody: Object) => {
        return await request(app.getHttpServer())
          .post(`/users/${relRoute[relation]}`)
          .set('Cookie', cookies)
          .send(reqBody);
      };

      const getBodyProperty = (relation: RelationType, body: Object): Object => {
        switch(relation) {

          case RelationType.friend:
            return body.friends_list;

          case RelationType.block:
            return body.blocked_list;
        }
      };


      /*
        ===================================================================
        -------------------------------------------------------------------
              Relations test
        -------------------------------------------------------------------
        ===================================================================
        */

      it(`gets ${relDescription[relation]} list of a newly created user`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            console.log(getBodyProperty(relation, resp.body));
            expect(getBodyProperty(relation, resp.body)).toHaveLength(0);
          });
      });

      it(`adds a ${relDescription[relation]} and gets list of friends`, async () => {
        await addRelation({ id: users[1].id })
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(1);
            expect(resp.body.friends_list[0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });

      it(`adds a ${relDescription[relation]} which already is in friends list`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
          })
          .then(
            async () =>
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
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(1);
            expect(resp.body.friends_list[0]).toHaveProperty(
              'login',
              users[1].login,
            );
          })
          .then(
            async () =>
              await request(app.getHttpServer())
                .post('/users/friends')
                .set('Cookie', cookies)
                .send({
                  id: users[1].id,
                }),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CONFLICT);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(1);
            expect(resp.body.friends_list[0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });

      it(`adds a ${relDescription[relation]} with a login instead of a UUID`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
          })
          .then(
            async () =>
              await request(app.getHttpServer())
                .post('/users/friends')
                .set('Cookie', cookies)
                .send({
                  id: users[1].login,
                }),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(0);
          });
      });

      it(`adds a ${relDescription[relation]} with a non existing UUID`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
          })
          .then(
            async () =>
              await request(app.getHttpServer())
                .post('/users/friends')
                .set('Cookie', cookies)
                .send({
                  id: randomUUID(),
                }),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CONFLICT);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(0);
          });
      });

      it(`adds a ${relDescription[relation]} with an empty body request`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
          })
          .then(
            async () =>
              await request(app.getHttpServer())
                .post('/users/friends')
                .set('Cookie', cookies)
                .send({}),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(0);
          });
      });

      it(`adds a ${relDescription[relation]} with an extra key in body request`, async () => {
        await request(app.getHttpServer())
          .get('/me')
          .set('Cookie', cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
          })
          .then(
            async () =>
              await request(app.getHttpServer())
                .post('/users/friends')
                .set('Cookie', cookies)
                .send({
                  id: users[1].id,
                  login: users[1].login,
                  extraKey: 'test',
                }),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await request(app.getHttpServer())
              .get('/me')
              .set('Cookie', cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty('friends_list');
            expect(resp.body.friends_list).toHaveLength(1);
            expect(resp.body.friends_list[0]).toHaveProperty(
              'login',
              users[1].login,
            );
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
    });

    /*
  ===================================================================
  -------------------------------------------------------------------
  test /friends
  -------------------------------------------------------------------
  ===================================================================
  */

    /*
 ===================================================================
 -------------------------------------------------------------------
 test /blocked
 -------------------------------------------------------------------
 ===================================================================
 */
  });
};

testSet(RelationType.friend);
testSet(RelationType.block);
