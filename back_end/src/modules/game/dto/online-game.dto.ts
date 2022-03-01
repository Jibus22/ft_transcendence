import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';

@Exclude()
export class OnlineGameDto {
  @ApiProperty()
  @Expose()
  watch: string;

  @ApiProperty()
  @Expose()
  map: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj.players.length === 0) return null;
    let usr = plainToClass(UserDto, value.obj.players[0].user, {
      excludeExtraneousValues: true,
    });
    usr['score'] = value.obj.players[0].score;
    delete usr['id'];
    return usr;
  })
  challenger: any;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj.players.length === 1) return null;
    let usr = plainToClass(UserDto, value.obj.players[1].user, {
      excludeExtraneousValues: true,
    });
    usr['score'] = value.obj.players[1].score;
    delete usr['id'];
    return usr;
  })
  opponent: any;
}
