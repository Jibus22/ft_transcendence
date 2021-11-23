import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { map } from 'rxjs';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api_status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api_status')
      .expect(200)
      .expect('online');
  });

  it('create user and get infos', () => {

    // let id_test: string;

    return request(app.getHttpServer())
      .post('/dev/createUserBatch')
      .send(
        [
          {
              "login": "fake-vgoldman-custome",
              "login_42": "fake-vgoldman",
              "photo_url_42": "https://cdn.intra.42.fr/users/vgoldman.jpg",
              "photo_url_local": null,
              "use_local_photo": false
          },
          {
              "login": "fake-frfrancd-custome",
              "login_42": "fake-frfrancd",
              "photo_url_42": "https://cdn.intra.42.fr/users/frfrancd.jpg",
              "photo_url_local": null,
              "use_local_photo": false
          },
          {
              "login": "fake-jle-corr-custome",
              "login_42": "fake-jle-corr",
              "photo_url_42": "https://cdn.intra.42.fr/users/jle-corr.jpg",
              "photo_url_local": null,
              "use_local_photo": false
          },
          {
              "login": "fake-mrouchy-custome",
              "login_42": "fake-mrouchy",
              "photo_url_42": "https://cdn.intra.42.fr/users/mrouchy.jpg",
              "photo_url_local": null,
              "use_local_photo": false
          },
          {
              "login": "fake-randomDude-custome",
              "login_42": "fake-randomDude",
              "photo_url_42": "https://cdn.intra.42.fr/users/medium_default.png",
              "photo_url_local": null,
              "use_local_photo": false
          }
      ]).expect(201);


    // request(app.getHttpServer())
    //   .post('http://localhost:3000/dev/signin')
    //   .send({
    //     "login": `${id_test}`
    //   })

    // return request(app.getHttpServer())
    //   .get('/dev')
    //   .expect(200)
    //   .expect('online');
  });


});
