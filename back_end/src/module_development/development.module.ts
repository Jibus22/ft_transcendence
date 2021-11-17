import { DevelopmentService } from './development.service';
import { UsersService } from '../module_users/service_users/users.service';
import { DevelopmentController } from './development.controller';
import { Module } from '@nestjs/common';
import { UsersModule } from '../module_users/users.module';

@Module({
	imports: [UsersModule],
	providers: [DevelopmentService],
	controllers: [DevelopmentController]
})
export class DevelopmentModule {}
