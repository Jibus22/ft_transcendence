import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { privateUserDto } from '../src/modules/users/dtos/private-user.dto';
import { UserDto } from '../src/modules/users/dtos/user.dto';
import { User } from '../src/modules/users/entities/users.entity';

export class CommonTest {
  constructor(private app: INestApplication) {}

  testUserBatch: Partial<User>[] = [
    {
      login: 'fake-vgoldman-custome',
      login_42: 'fake-vgoldman',
      photo_url_42: 'https://cdn.intra.42.fr/users/vgoldman.jpg',
      use_local_photo: false,
    },
    {
      login: 'fake-frfrancd-custome',
      login_42: 'fake-frfrancd',
      photo_url_42: 'https://cdn.intra.42.fr/users/frfrancd.jpg',
      use_local_photo: false,
    },
    {
      login: 'fake-jle-corr-custome',
      login_42: 'fake-jle-corr',
      photo_url_42: 'https://cdn.intra.42.fr/users/jle-corr.jpg',
      use_local_photo: false,
    },
    {
      login: 'fake-mrouchy-custome',
      login_42: 'fake-mrouchy',
      photo_url_42: 'https://cdn.intra.42.fr/users/mrouchy.jpg',
      use_local_photo: false,
    },
    {
      login: 'fake-randomDude-custome',
      login_42: 'fake-randomDude',
      photo_url_42: 'https://cdn.intra.42.fr/users/medium_default.png',
      use_local_photo: false,
    },
    {
      login: 'fake-user-custome',
      login_42: 'fake-user',
      photo_url_42: 'https://cdn.intra.42.fr/users/medium_default.png',
      use_local_photo: false,
    },
  ];

  async logUser(login: string) {
    return await request(this.app.getHttpServer()).post('/dev/signin').send({
      login,
    });
  }

  async logOutUser() {
    return await request(this.app.getHttpServer()).delete('/auth/signout');
  }

  updateCookies(response: request.Response, cookies: string[]): string[] {
    const tmpCookies = response.get('Set-Cookie');
    if (tmpCookies && tmpCookies !== cookies) {
      return tmpCookies;
    }
    return cookies;
  }

  getCookies(response: request.Response): string[] {
    return response.get('Set-Cookie') || [];
  }

  async getMe(cookies: string[]) {
    return await request(this.app.getHttpServer())
      .get(`/me`)
      .set('Cookie', cookies);
  }

  async createFakeUsers() {
    return await request(this.app.getHttpServer())
      .post('/dev/createUserBatch')
      .send(this.testUserBatch);
  }

  async deleteFakeUsers(users: { login: string }[]) {
    return await request(this.app.getHttpServer())
      .delete('/dev/deleteUserBatch')
      .send(users);
  }
}
