import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ChatMessage } from '../chat/entities/chatMessage.entity';
import { Participant } from '../chat/entities/participant.entity';
import { Restriction } from '../chat/entities/restriction.entity';
import { Room } from '../chat/entities/room.entity';
import { User } from '../users/entities/users.entity';
import { UserPhoto } from '../users/entities/users_photo.entity';
import { Game } from '../game/entities/game.entity';
import { Player } from '../game/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const testerOrmConfig: TypeOrmModuleOptions = {
      type: 'better-sqlite3',
      database: process.env.DB_NAME,
      entities: [
        User,
        UserPhoto,
        Player,
        Game,
        Room,
        ChatMessage,
        Participant,
        ChatMessage,
        Restriction,
      ],
      synchronize: true,
    };

    return process.env.NODE_ENV === 'test'
      ? TypeOrmModule.forRoot(testerOrmConfig)
      : TypeOrmModule.forRoot();
  }
}
