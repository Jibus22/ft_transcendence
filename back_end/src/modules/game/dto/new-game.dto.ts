import { UserDto } from '../../users/dtos/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Exclude, Expose, plainToClass } from 'class-transformer';
import { Player } from '../entities/player.entity';

@Exclude()
export class NewGameDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  map: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    const users = value.obj.players.map((elem: Player) => elem.user);
    return plainToClass(UserDto, users);
  })
  users: UserDto[];
}
