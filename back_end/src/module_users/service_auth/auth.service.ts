import { AxiosRequestConfig } from 'axios';
import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../service_users/users.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { User } from '../entities/users.entity';
import { map, lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async registerUser(queryCode: string, queryState: string) {
    const token = await this.getAuthToken(queryCode, queryState);
    const user: Partial<User> = await this.getUserData(token);
    return this.updateDatabase(user);
  }

  async getAuthToken(queryCode: string, queryState: string): Promise<string> {
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
        .post(
          this.configService.get('AUTH_API_TOKEN_URL'),
          null,
          requestConfig,
        )
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
        .get(this.configService.get('AUTH_API_USER_ENDPOINT'), requestConfig)
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

  async updateDatabase(user: Partial<User>) {
    const users = await this.usersService.find(user.login);
    if (users.length) {
      return await this.usersService.update(users[0].id, {
        photo_url_42: users[0].photo_url_42,
      } as User).catch((e) => {
        throw new BadGatewayException(e.message);
      });
    }
    user.use_local_photo = false;
    return await this.usersService.create(user).catch((e) => {
      throw new BadGatewayException(e.message);
    });
  }

}
