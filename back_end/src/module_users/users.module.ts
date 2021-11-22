import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './service_users/users.service';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { AuthService } from './service_auth/auth.service';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { HttpModule } from '@nestjs/axios';
import { RelationsService } from './service_relations/relations.service';
import { AuthController } from './auth.controller';
import { MeController } from './me.controller';
import { MeService } from './service_me/me.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  providers: [
    MeService,
    RelationsService,
    UsersService,
    AuthService
  ],
  controllers: [UsersController, AuthController, MeController],
  exports: [UsersService]
})

export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
