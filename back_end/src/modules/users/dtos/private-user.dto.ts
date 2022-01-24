import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { RoomDto } from '../../chat/dto/room.dto';
import { Game } from '../../game/entities/game.entity';
import { Player } from '../../game/entities/player.entity';
import { UserDto } from './user.dto';

@Exclude()
export class privateUserDto extends UserDto {
  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.local_photo ? true : false;
  })
  storeCustomPhoto: boolean;

  @ApiProperty({ type: RoomDto, isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(RoomDto, value.obj.rooms_ownership);
  })
  rooms_owned: RoomDto[];

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.twoFASecret && value.obj.useTwoFA ? true : false;
  })
  hasTwoFASecret: boolean;

  @ApiProperty()
  @Expose()
  games: Game[];

  @ApiProperty()
  @Expose()
  is_site_owner: boolean;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj?.players ? value.obj.players.length : 0;
  })
  games_nbr: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj?.players) {
      const players: Player[] = value.obj.players;
      const wins = players.filter(
        (pl) => pl.score === parseInt(process.env.WINNING_SCORE),
      );
      return wins.length;
    } else {
      return 0;
    }
  })
  wins_nbr: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj?.players) {
      const players: Player[] = value.obj.players;
      const losses = players.filter(
        (pl) => pl.score !== parseInt(process.env.WINNING_SCORE),
      );
      return losses.length;
    } else {
      return 0;
    }
  })
  losses_nbr: number;
}
