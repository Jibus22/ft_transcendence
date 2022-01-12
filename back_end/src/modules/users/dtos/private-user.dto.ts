import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { RoomDto } from '../../chat/dto/room.dto';
import { UserDto } from './user.dto';
import { Game } from '../../game/entities/game.entity';

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
}
