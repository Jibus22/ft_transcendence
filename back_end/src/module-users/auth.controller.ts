import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Post, Query, Redirect, Res, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './service-auth/auth.service';
import { UsersService } from './service-users/users.service';
import { authenticator } from 'otplib';
import { privateUserDto } from './dtos/private-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

	constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private configService: ConfigService) {}

    @Get('/callback')
    @Redirect()
    async authCallback(@Query() query: {code: string, state: string}, @Session() session: any) {

      const user = await this.authService.registerUser(query.code, query.state);
      if ( ! user) {
        throw new InternalServerErrorException('Could not identify user.')
      }
      session.userId = user.id;
      session.hasTwoFaAuthenticated = user.useTwoFA;
      session.isTwoFaAuthenticated = false;
      return { url: this.configService.get('AUTH_REDIRECT_URL') };
    }

    @Delete('/signout')
    @ApiOperation({
      summary: 'Remove userId from user\'s session cookie'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged out' })
    signOut(@Session() session: any) {
      session.userId = null;
      session.hasTwoFaAuthenticated = null;
      session.isTwoFaAuthenticated = null;
    }


  /*
  ===================================================================
  -------------------------------------------------------------------
        Two factor authentication
  -------------------------------------------------------------------
  ===================================================================
  */

    //TODO use guard ?

    @Post('/2fa/generate')
    @ApiOperation({
      summary: 'Internally set a new key to user and return qr-code + key in headers'
    })
    // @ApiResponse({ }) // TODO set png ?
    @ApiResponse({ status: HttpStatus.OK, description: 'Qrcode as png and Key header' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '2fa key already set' })
    async generate2faKey(@CurrentUser() userId, @Res() response) {

      const {totpAuthUrl, secret} = await this.authService.create2faKey(userId)
        .catch((error) => {
          throw new BadRequestException(error);
        });
      response.setHeader('content-type','image/png');
      response.setHeader('secretKey', secret); //TODO is it safe ?
      return this.authService.qrCodeStreamPipe(response, totpAuthUrl);
    }

    @Post('/2fa/turn-off')
    @ApiOperation({
      summary: 'Turns off the 2fa, effectively removing the key from the db'
    })
    @ApiResponse({ type: privateUserDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Key removed from the db' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'missing user in session or missing 2fa key in database' })
    async turn2fa_off(@Session() session) {
      return await this.authService.turn2fa_off(session)
        .catch((err) => {
          throw new BadRequestException(err);
        });
    }

    @Post('/2fa/turn-on')
    @ApiOperation({
      summary: 'Turns on the 2fa if token is valid'
    })
    @ApiResponse({ type: privateUserDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Token is valid and 2fa is set' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'invalid token' })
    async turn2fa_on(@Session() session, @Body() body: { token: string } ) {
      // TODO: use dto for body !
      console.log('token:', body.token);
      return await this.authService.turn2fa_on(session, body.token)
        .catch((err) => {
          throw new BadRequestException(err);
        });
    }

    @Post('/2fa/authenticate')
    // @ApiOperation({
    //   summary: 'TODO'
    // })
    // @ApiResponse({ status: HttpStatus.OK, description: 'User logged out' })
    async authenticate2fa(@CurrentUser() userId, @Res() response) {
    }
}
