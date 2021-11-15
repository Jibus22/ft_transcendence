import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './service_users/users.service';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { AuthService } from './service_auth/auth.service';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { HttpModule } from '@nestjs/axios';
import { FriendsService } from './service_friends/friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  providers: [
    FriendsService,
    UsersService,
    AuthService
  ],
  controllers: [UsersController],
  exports: [UsersService]
})

export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
