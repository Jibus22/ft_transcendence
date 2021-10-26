import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
		const email = 'hello@signup.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
			.send({email, password: 'abcd'})
			.expect(201)
			.then((resp) => {
				const {id, email} = resp.body;
				expect(id).toBeDefined();
				expect(email).toEqual(email);
			})
  });

  it('signup as a new user, then get currently logged user ', async () => {
		const email = 'hello@signup.com';

    const resp = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({email, password: 'abcd'})
      .expect(201)

    const cookie = resp.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
			.expect(200)

    expect(body.email).toEqual(email);
  });
});
