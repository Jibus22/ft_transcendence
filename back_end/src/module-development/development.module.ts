import { DevelopmentService } from './development.service';
import { UsersService } from '../module-users/service-users/users.service';
import { DevelopmentController } from './development.controller';
import { Module } from '@nestjs/common';
import { UsersModule } from '../module-users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../module-users/entities/users.entity';
import { UserPhoto } from '../module-users/entities/users_photo.entity';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([User])],
	providers: [DevelopmentService],
	controllers: [DevelopmentController]
})
export class DevelopmentModule {}
