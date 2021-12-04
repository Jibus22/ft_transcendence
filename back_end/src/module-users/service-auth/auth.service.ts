import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { User } from '../entities/users.entity';
import { UsersService } from '../service-users/users.service';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';

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
    const users = await this.usersService.findByLogin42(user.login_42);
    if (users.length) {
      return await this.usersService
        .update(users[0].id, {
          photo_url_42: users[0].photo_url_42,
        } as User)
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

  async create2faKey(userId: string) {
    const user = await this.usersService.findOne(userId);

    // TODO uncomment to avoid key deletion
    if (user.twoFASecret) {
      throw '2fa key already set';
    }

    const secret = authenticator.generateSecret();
    const app_name = this.configService.get(
      'TWO_FACTOR_AUTHENTICATION_APP_NAME',
    );
    const totpAuthUrl = authenticator.keyuri(user.login_42, app_name, secret);

    await this.usersService.update(userId, { twoFASecret: secret });
    return {
      totpAuthUrl,
      secret,
    };
  }

  async turn2fa_off(session) {
    const user = await this.usersService.findOne(session.userId);

    if (user && user.twoFASecret) {
      session.useTwoFA = false;
      session.isTwoFAutanticated = null;
      return await this.usersService.update(session.userId, {
        twoFASecret: null,
        useTwoFA: false,
      });
    }
    throw 'missing user in session or missing 2fa key in database';
  }

  async turn2fa_on(session, token: string) {
    const user = await this.usersService.findOne(session.userId); //TODO manage error

    if (user && this.verify_code(token, user.twoFASecret)) {
      user.useTwoFA = true;
      return await this.usersService.update(session.userId, {
        useTwoFA: true,
      });
    }
    throw 'invalid token';
  }

  private async verify_code(token: string, secret: string) {
    console.log(token, secret);
    return authenticator.verify({
      token,
      secret,
    });
  }
}
