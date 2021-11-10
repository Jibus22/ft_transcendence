import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { User } from './users.entity';
import { getSystemErrorMap } from 'util';
import { UserDto } from './dtos/user.dto';
import { map, interval, lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  // async signin(login_42: string) {

  //   let [user] = await this.usersService.find(login_42);

  //   if (!user) {
  //     user = this.usersService.create(login_42);
  //   }
  // 	return user;
  // }

  async signinUser(queryCode: string, queryState: string) {
    const token = await this.getAuthToken(queryCode, queryState);
    const user: Partial<User> = await this.getUserData(token);
    this.addUser(user);
  }

  async getAuthToken(queryCode: string, queryState: string) {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        grant_type: 'authorization_code',
        client_id: this.configService.get('AUTH_CLIENT_ID'),
        client_secret: this.configService.get('AUTH_CLIENT_SECRET'),
        code: queryCode,
        redirect_uri: this.configService.get('AUTH_CALLBACK_URL'),
        state: queryState,
      },
    };

    return lastValueFrom(
      this.httpService
        .post(this.configService.get('AUTH_42API_URL'), null, requestConfig)
        .pipe(
          map((resp) => {
            return resp.data.access_token;
          }),
        ),
    ).catch((err) => {
      throw new BadGatewayException(err.message);
    });
  }

  async getUserData(token: string): Promise<Partial<User>> {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: ` Bearer ${token}`,
      },
    };

    return lastValueFrom(
      this.httpService
        .get(this.configService.get('AUTH_42API_USER_ENDPOINT'), requestConfig)
        .pipe(
          map((resp) => {
            return {
              login: resp.data.login,
              login_42: resp.data.login,
              photo_url_42: resp.data.image_url,
            };
          }),
        ),
    ).catch((err) => {
      throw new BadGatewayException(err.message);
    });
  }

  async addUser(user: Partial<User>): Promise<User> {
    const users = await this.usersService.find(user.login);
    if (users.length) {
      return users[0];
    }
    return this.usersService.create(user);
  }
}
