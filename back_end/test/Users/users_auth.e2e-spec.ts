import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CommonTest } from '../helpers';
const totp = require('totp-generator');

describe('user controller: auth routes (e2e)', () => {
  let app: INestApplication;
  let commons: CommonTest;
  let users;
  let cookies: string[];
  let loggedUser;
  let secret: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);

    await app.init();

    users = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {});
    expect(users.length).toEqual(commons.testUserBatch.length);

    loggedUser = commons.testUserBatch[0];

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

  async function getIsLogged(cookiesParam: string[]) {
    return await request(app.getHttpServer())
      .get('/me/is-logged')
      .set('Cookie', cookiesParam);
  }

  async function generateQrCode(body, cookiesParam: string[]) {
    return await request(app.getHttpServer())
      .post('/auth/2fa/generate')
      .set('Cookie', cookiesParam)
      .send(body);
  }

  async function turn2Fa_on(body, cookiesParam: string[]) {
    return await request(app.getHttpServer())
      .post('/auth/2fa/turn-on')
      .set('Cookie', cookiesParam)
      .send(body);
  }

  async function turn2Fa_off(cookiesParam: string[]) {
    return await request(app.getHttpServer())
      .post('/auth/2fa/turn-off')
      .set('Cookie', cookiesParam);
  }

  async function authenticate2fa(body, cookiesParam: string[]) {
    return await request(app.getHttpServer())
      .post('/auth/2fa/authenticate')
      .set('Cookie', cookiesParam)
      .send(body);
  }

  async function generateAndValidateQrCode() {
    return await generateQrCode(null, cookies)
      .then(async (response) => {
        cookies = commons.updateCookies(response, cookies);
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await turn2Fa_on({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await turn2Fa_on({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        cookies = commons.updateCookies(response, cookies);
      });
  }

  async function doFull2faProcess() {
    return await generateAndValidateQrCode()
      .then(async () => {
        return await authenticate2fa({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await authenticate2fa({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        cookies = commons.updateCookies(response, cookies);
      });
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        2FA routes tests
  -------------------------------------------------------------------
  ===================================================================
  */

  it('generates 2fa qrCode, activates it and loggin with it (normal full 2fa flow)', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
        return await turn2Fa_on({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await turn2Fa_on({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('hasTwoFASecret', true);

        cookies = commons.updateCookies(response, cookies);
        return await authenticate2fa({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await authenticate2fa({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);

        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('generates 2fa qrCode, tries to loggin without activating it', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        commons.updateCookies(response, cookies);
        expect(response.body).toHaveProperty('hasTwoFASecret', false);

        return await authenticate2fa({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body?.message).toBe('user has no 2fa activated secret');
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
      });
  });

  it('generates 2fa qrCode, tries to activate with invalid token', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
        return await turn2Fa_on({ token: '000000' }, cookies);
      })
      .then(async (response) => {
        cookies = commons.updateCookies(response, cookies);
        expect(response.body).toHaveProperty('message', 'invalid token');
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('generates 2fa qrCode, tries to activate with invalid token format', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
        return await turn2Fa_on({ token: 'asdbdnvdsf' }, cookies);
      })
      .then(async (response) => {
        cookies = commons.updateCookies(response, cookies);
        expect(response.body).toHaveProperty('message', 'invalid token');
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('generates 2fa qrCode, activates it and tries to authenticate with wrong token', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
        return await turn2Fa_on({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await turn2Fa_on({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('hasTwoFASecret', true);

        cookies = commons.updateCookies(response, cookies);
        return await authenticate2fa({ token: '000000' }, cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toHaveProperty('message', 'invalid token');
        response = await authenticate2fa({ token: await totp(secret) }, cookies);
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await turn2Fa_on({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('generates 2fa qrCode, activates it and tries to authenticate it without session cookie', async () => {
    let secret: string;

    await generateQrCode(null, cookies)
      .then(async (response) => {
        expect(response.headers.secretkey).toBeDefined();
        expect(response.headers['content-type']).toEqual('image/png');
        secret = response.headers.secretkey;
      })
      .then(async () => {
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
        return await turn2Fa_on({ token: await totp(secret) }, cookies);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await turn2Fa_on({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('hasTwoFASecret', true);

        cookies = commons.updateCookies(response, cookies);
        return await authenticate2fa({ token: await totp(secret) }, null);
      })
      .then(async (response) => {
        // second try in case the TOTP was sent at expire time
        expect(response.body).toHaveProperty('message', 'no user logged');
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await authenticate2fa({ token: await totp(secret) }, cookies);
        }
        expect(response.status).toBe(HttpStatus.CREATED);

        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('tries to activate without generating qr-code', async () => {
    await turn2Fa_on({ token: '000000' }, cookies)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toHaveProperty(
          'message',
          'user does not have 2fa secret',
        );
        expect(response.headers.secretkey).not.toBeDefined();
        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
      });
  });

  it('tries to deactivate without generating qr-code', async () => {
    await turn2Fa_off(cookies)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toHaveProperty(
          'message',
          'user does not have 2fa secret',
        );
        expect(response.headers.secretkey).not.toBeDefined();
        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
      });
  });

  it('tries to authenticate without generating qr-code', async () => {
    await authenticate2fa({ token: '000000' }, cookies)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toHaveProperty(
          'message',
          'user does not have 2fa secret',
        );
        expect(response.headers.secretkey).not.toBeDefined();
        cookies = commons.updateCookies(response, cookies);
        return await commons.getMe(cookies);
      })
      .then(async (response) => {
        expect(response.body).toHaveProperty('hasTwoFASecret', false);
      });
  });

  it('gets /me/is-logged when not using 2FA', async () => {
    await getIsLogged(cookies).then((response) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.header).toHaveProperty(
        'Completed-Auth'.toLowerCase(),
        'true',
      );
    });
  });

  it('gets /me/is-logged when using 2FA, after 2FA full process', async () => {
    await doFull2faProcess()
      .then(async () => {
        return await getIsLogged(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.header).toHaveProperty(
          'Completed-Auth'.toLowerCase(),
          'true',
        );
      });
  });

  it('gets /me/is-logged when using 2FA, with 2fa turned off', async () => {
    let localCookies = cookies;

    await doFull2faProcess()
      .then(async () => {
        return await turn2Fa_off(cookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        cookies = commons.getCookies(response);
        return await getIsLogged(cookies);
      })
      .then(async (response) => {
        expect(response.header).toHaveProperty(
          'Completed-Auth'.toLowerCase(),
          'true',
        );
      });
  });

  it('gets /me/is-logged after partial login', async () => {
    let localCookies = cookies;

    await generateAndValidateQrCode()
      .then(async () => {
        return await commons.logOutUser();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        localCookies = commons.getCookies(response);
        return await getIsLogged(localCookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        return await commons.logUser(loggedUser.login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        localCookies = commons.getCookies(response);
        return await getIsLogged(localCookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.header).toHaveProperty(
          'Completed-Auth'.toLowerCase(),
          'false',
        );
        return await authenticate2fa({ token: await totp(secret) }, localCookies);
      })
      .then(async (response) => {
        if (response.status === HttpStatus.BAD_REQUEST) {
          response = await authenticate2fa({ token: await totp(secret) }, localCookies);
        }
        localCookies = commons.getCookies(response);
        expect(response.status).toBe(HttpStatus.CREATED);
        return await getIsLogged(localCookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.header).toHaveProperty(
          'Completed-Auth'.toLowerCase(),
          'true',
        );
      });
    });

  /*
  ===================================================================
  -------------------------------------------------------------------
          Auth routes tests
  -------------------------------------------------------------------
  ===================================================================
  */


  it('logs user out', async () => {
    let localCookies: string[];

    await commons.logOutUser()
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
         localCookies = commons.getCookies(response);
        expect(localCookies.length).toBe(0);
        return await getIsLogged(localCookies);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

});
