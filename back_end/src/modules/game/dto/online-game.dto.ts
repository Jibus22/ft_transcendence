import { ApiProperty } from '@nestjs/swagger';
import { Transform, Exclude, Expose, plainToClass } from 'class-transformer';
import { UserDto } from 'src/modules/users/dtos/user.dto';

@Exclude()
export class OnlineGameDto {
  @ApiProperty()
  @Expose()
  watch: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
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
    let usr = plainToClass(UserDto, value.obj.players[1].user, {
      excludeExtraneousValues: true,
    });
    usr['score'] = value.obj.players[1].score;
    delete usr['id'];
    return usr;
  })
  opponent: any;
}
