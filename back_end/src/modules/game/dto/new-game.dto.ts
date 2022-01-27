import { UserDto } from '../../users/dtos/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Exclude, Expose, plainToClass } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
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
    let users: User[] = [];
    value.obj.players.forEach((elem: Player) => {
      users.push(elem.user);
    });
    return plainToClass(UserDto, users);
  })
  users: UserDto[];
}
