import { BadRequestException, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Query, Redirect, Res, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './service-auth/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

	constructor(
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
      session.hasTwoFaAuthenticated = user.isTwoFactorEnable;
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

    @Get('/generate2faKey')
    //TODO use guard ?
    @ApiOperation({
      summary: 'TODO'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged out' })
    async generate2faKey(@CurrentUser() userId, @Res() response) {

      const {totpAuthUrl, secret} = await this.authService.create2faKey(userId)
        .catch((error) => {
          throw new BadRequestException(error);
        });
      response.setHeader('content-type','image/png');
      response.setHeader('secretKey', secret); //TODO is it safe ?
      return this.authService.qrCodeStreamPipe(response, totpAuthUrl);
    }


}
