import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
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

const relBodyResponse = ['friends_list', 'blocked_list'];

const relRoute = ['friend', 'block'];

const relDescription = ['friend', 'blocked account'];

/*
  ===================================================================
  -------------------------------------------------------------------
        testSet function is call at the end of the file with
        each kind of relation
  -------------------------------------------------------------------
  ===================================================================
  */

const testSet = async (relation: RelationType) => {

  let app: INestApplication;
  let commons: CommonTest;
  const relationProperty = relBodyResponse[relation];
  const relationDesc = relDescription[relation];
  let loggedUser;

  describe(`user controller: users relations routes (e2e): ${relationDesc} `, () => {

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      commons = new CommonTest(app);
      loggedUser = commons.testUserBatch[0];
      await app.init();
    });

    describe(`${relationDesc} list manipulation`, () => {
      let users;
      let cookies;

      beforeEach(async () => {
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

      const addRelation = async (reqBody: Object) => {
        return await request(app.getHttpServer())
          .post(`/users/${relRoute[relation]}`)
          .set('Cookie', cookies)
          .send(reqBody);
      };

      /*
        ===================================================================
        -------------------------------------------------------------------
              Relations tests
        -------------------------------------------------------------------
        ===================================================================
        */

      it(`gets ${relationDesc} list of a newly created user`, async () => {
        await commons.getMe(cookies).then((resp) => {
          expect(resp.body).toHaveProperty(relationProperty);
          expect(resp.body[relationProperty]).toHaveLength(0);
        });
      });

      it(`adds a relation: ${relationDesc} and get list of relations`, async () => {
        await addRelation({ id: users[1].id })
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });

      it(`adds a relation: ${relationDesc} which already exists and
          get list of relations`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
          })
          .then(async () => await addRelation({ id: users[1].id }))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          })
          .then(async () => await addRelation({ id: users[1].id }))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CONFLICT);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });

      it(`adds a ${relationDesc} with a login instead of a UUID`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
          })
          .then(async () => await addRelation({ id: users[1].login }))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          });
      });

      it(`adds a ${relationDesc} with a non existing UUID`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
          })
          .then(async () => await addRelation({ id: randomUUID() }))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CONFLICT);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          });
      });

      it(`adds a ${relationDesc} with an empty body request`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
          })
          .then(async () => await addRelation({}))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          });
      });

      it(`adds a ${relationDesc} with an extra key in body request`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
          })
          .then(
            async () =>
              await addRelation({
                id: users[1].id,
                login: users[1].login,
                extraKey: 'test',
              }),
          )
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });

      it(`tries to add oneself to ${relationDesc} and fails`, async () => {
        const users = await commons
          .createFakeUsers()
          .then((response) => response.body);

        const cookies = await commons
          .logUser(loggedUser.login)
          .then((response) => commons.getCookies(response));
        expect(cookies.length).toBeGreaterThanOrEqual(1);

        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          })
          .then(async () => await addRelation({ id: users[0].id }))
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.BAD_REQUEST);
            return await commons.getMe(cookies);
          })
          .then(async (resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          });
      });

      it(`adds a relation: ${relationDesc} and delete it`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(0);
          })
          // ADD relation
          .then(async () => await addRelation({ id: users[1].id }))
          // check user relations
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          })
          // DELETE relation
          .then(
            async () =>
              await request(app.getHttpServer())
                .delete(`/users/${relRoute[relation]}`)
                .set('Cookie', cookies)
                .send({
                  id: users[1].id,
                }),
          )
          // check user relations
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.OK);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty]).toHaveLength(0);
          });
      });

      it(`tries to delete a non existing relation: ${relationDesc}`, async () => {
        await commons.getMe(cookies)
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(0);
          })
          // ADD relation
          .then(async () => await addRelation({ id: users[1].id }))
          // check user relations
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.CREATED);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          })
          // tries to DELETE relation with user 2 which does not exist
          .then(
            async () =>
              await request(app.getHttpServer())
                .delete(`/users/${relRoute[relation]}`)
                .set('Cookie', cookies)
                .send({
                  id: users[2].id,
                }),
          )
          // check user relations
          .then(async (resp) => {
            expect(resp.status).toEqual(HttpStatus.OK);
            return await commons.getMe(cookies);
          })
          .then((resp) => {
            expect(resp.body).toHaveProperty(relationProperty);
            expect(resp.body[relationProperty].length).toEqual(1);
            expect(resp.body[relationProperty][0]).toHaveProperty(
              'login',
              users[1].login,
            );
          });
      });
    }); // <----- end testSet
  });
};


/*
  ===================================================================
  -------------------------------------------------------------------
        Here are called test sets with each relation type available
        If any new relation are implemented, simply add them to
        the enum and make a call here.
  -------------------------------------------------------------------
  ===================================================================
  */

testSet(RelationType.friend);
testSet(RelationType.block);
