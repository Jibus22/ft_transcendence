import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { Transform, plainToClass, Exclude, Expose } from 'class-transformer';

export class RegularPlayerDto {
  @ApiProperty()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.user);
  })
  user: UserDto;

  @ApiProperty()
  score: number;
}

@Exclude()
export class HistoryGameDto {
  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.updatedAt - value.obj.createdAt;
  })
  duration: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(RegularPlayerDto, value.obj.players);
  })
  players: RegularPlayerDto[];
}
