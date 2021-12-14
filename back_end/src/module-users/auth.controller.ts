import { Controller, Delete, Get, HttpStatus, InternalServerErrorException, Query, Redirect, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      return { url: this.configService.get('AUTH_REDIRECT_URL') };
    }

    @Delete('/signout')
    @ApiOperation({
      summary: 'Remove userId from user\'s session cookie'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged out' })
    signOut(@Session() session: any) {
      session.userId = null;
    }
}
