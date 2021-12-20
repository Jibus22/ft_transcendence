import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { DevelopmentController } from './development.controller';
import { DevelopmentService } from './development.service';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([User])],
	providers: [DevelopmentService],
	controllers: [DevelopmentController]
})
export class DevelopmentModule {}
