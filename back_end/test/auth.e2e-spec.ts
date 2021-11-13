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

  // it('handles a signup request', () => {
  //   const login = "fake-testUser-custome";
	// 	const login_42 = "fake-testUser";
	// 	const photo_url_42 = "https://cdn.intra.42.fr/users/testUser.jpg";
	// 	const photo_url_local = null;
	// 	const use_local_photo = false;

  //   return request(app.getHttpServer())
  //     .post('/dev/createUserBatch')
	// 		.send({login, login_42, photo_url_42, photo_url_local, use_local_photo})
	// 		.expect(201)
	// 		.then((resp) => {
    // 			const {id, email} = resp.body;
    // 			expect(id).toBeDefined();
    // 			expect(login).toEqual(login);
    // 			expect(login_42).toEqual(login_42);
    // 			expect(photo_url_42).toEqual(photo_url_42);
    // 			expect(photo_url_local).toEqual(photo_url_local);
    // 			expect(use_local_photo).toEqual(use_local_photo);
    // 		})
    // });

    it('registers a new user with 42OAuth', async () => {

      const login = "fake-testUser-custome";
      const login_42 = "fake-testUser";
      const photo_url_42 = "https://cdn.intra.42.fr/users/testUser.jpg";
      // const photo_url_local = null;
      // const use_local_photo = false;


  });


  it('signup as a new user, then get currently logged user ', async () => {
		const email = 'hello@signup.com';

    const resp = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({email, password: 'abcd'})
      .expect(201)

    const cookie = resp.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
			.expect(200)

    expect(body.email).toEqual(email);
  });
});


//___735984yuteirhjk784561230
//e2e-testing@mydomain.com

