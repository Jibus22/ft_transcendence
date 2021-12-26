import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { RoomDto } from '../../chat/dto/room.dto';
import { UserDto } from './user.dto';

@Exclude()
export class privateUserDto extends UserDto {
  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.local_photo ? true : false;
  })
  storeCustomPhoto: boolean;

  @ApiProperty({ type: UserDto, isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.friends_list);
  })
  friends_list: UserDto[];

  @ApiProperty({ type: UserDto, isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.blocked_list);
  })
  blocked_list: UserDto[];

  @ApiProperty({ type: RoomDto, isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(RoomDto, value.obj.rooms_ownership);
  })
  rooms_owned: RoomDto[];

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj.twoFASecret ? true : false;
  })
  hasTwoFASecret: boolean;

  // TODO remove debug
  @Expose()
  useTwoFA: boolean;
}
