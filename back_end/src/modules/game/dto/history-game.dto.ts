import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { Transform, Type, Exclude, Expose } from 'class-transformer';

export class RegularPlayerDto {
  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty()
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}

@Exclude()
export class HistoryGameDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return parseInt(value.obj.createdAt);
  })
  createdAt: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.updatedAt - value.obj.createdAt;
  })
  duration: number;

  @ApiProperty()
  @Expose()
  @Type(() => RegularPlayerDto)
  players: RegularPlayerDto[];
}
