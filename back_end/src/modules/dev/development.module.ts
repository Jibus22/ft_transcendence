import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { DevelopmentController } from './development.controller';
import { DevelopmentService } from './development.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
})
export class DevelopmentModule {
  static forRoot(): DynamicModule {
    if (process.env.NODE_ENV === 'production') {
      return {
        module: DevelopmentModule,
      };
    }

    return {
      module: DevelopmentModule,
      providers: [DevelopmentService],
      exports: [DevelopmentService],
      controllers: [DevelopmentController],
    };
  }
}
