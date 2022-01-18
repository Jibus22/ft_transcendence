import { DynamicModule, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GameModule } from '../game/game.module';
import { DevelopmentController } from './development.controller';
import { DevelopmentService } from './development.service';

@Module({
  imports: [UsersModule, GameModule],
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
