import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { lastValueFrom, map } from 'rxjs';
import { User } from '../entities/users.entity';
import { UsersService } from '../service-users/users.service';

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

    return await lastValueFrom(
      this.httpService
        .post(this.configService.get('AUTH_API_TOKEN_URL'), null, requestConfig)
        .pipe(
          map((resp) => {
            return resp.data.access_token;
          }),
        ),
    ).catch((err) => {
      throw new BadGatewayException(err.message);
    });
  }

  async getUserData(token: string) {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: ` Bearer ${token}`,
      },
    };

    return await lastValueFrom(
      this.httpService
        .get(this.configService.get('AUTH_API_USER_ENDPOINT'), requestConfig)
        .pipe(
          map((resp) => {
            return {
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
    const users = await this.usersService.find({ login_42: user.login_42 });
    if (users.length) {
      return await this.usersService
        .update(users[0].id, {
          photo_url_42: user.photo_url_42,
        })
        .catch((e) => {
          throw new BadGatewayException(e.message);
        });
    }
    user.login = user.login_42;
    user.use_local_photo = false;
    return await this.usersService.create(user).catch((e) => {
      throw new BadGatewayException(e.message);
    });
  }

  clearSession(session) {
    delete session.userId;
    delete session.useTwoFA;
    delete session.isTwoFAutanticated;
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        Two Factor Authentication
  -------------------------------------------------------------------
  ===================================================================
  */

  async qrCodeStreamPipe(stream: Response, otpPathUrl: string) {
    return toFileStream(stream, otpPathUrl);
  }

  async create2faKey(user: User) {
    if (user.twoFASecret && user.useTwoFA) {
      throw '2fa key already set';
    }

    const secret = authenticator.generateSecret();
    const app_name = this.configService.get(
      'TWO_FACTOR_AUTHENTICATION_APP_NAME',
    );
    const totpAuthUrl = authenticator.keyuri(user.login_42, app_name, secret);

    await this.usersService.update(user.id, { twoFASecret: secret });
    return {
      totpAuthUrl,
      secret,
    };
  }

  private async getValidUser(session) {
    return await this.usersService
      .findOne(session.userId)
      .then((user: User) => {
        if (!user) throw 'no user logged';
        if (!user.twoFASecret) throw 'user does not have 2fa secret';
        return user;
      });
  }

  async turn2fa_off(session) {
    const user = await this.getValidUser(session);
    if (user) {
      session.useTwoFA = false;
      session.isTwoFAutanticated = null;
      return await this.usersService.update(session.userId, {
        twoFASecret: null,
        useTwoFA: false,
      });
    }
  }

  async turn2fa_on(session, token: string) {
    const user = await this.getValidUser(session);
    if (user) {
      if (!authenticator.check(token, user.twoFASecret)) {
        throw 'invalid token';
      }
      session.useTwoFA = true;
      return await this.usersService.update(session.userId, {
        useTwoFA: true,
      });
    }
  }

  async authenticate2fa(session, token: string) {
    const user = await this.getValidUser(session);

    if (!user.useTwoFA || !user.twoFASecret) {
      throw 'user has no 2fa activated secret';
    }

    if (authenticator.check(token, user.twoFASecret)) {
      session.isTwoFAutanticated = true;
    } else {
      throw 'invalid token';
    }
  }
}
