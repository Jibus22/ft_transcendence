import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { Transform, Exclude, Expose, plainToClass } from 'class-transformer';
import { Player } from '../entities/player.entity';

@Exclude()
export class LeaderBoardDto {
  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.players.length;
  })
  games_count: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.players.filter((elem: Player) => {
      return elem.score === 10;
    }).length;
  })
  games_won: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.players.filter((elem: Player) => {
      return elem.score < 10;
    }).length;
  })
  games_lost: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj);
  })
  user: UserDto;
}
