import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';

@Exclude()
export class ChatMessageDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.sender);
  })
  sender: UserDto;

  // @ApiProperty()
  // @Expose()
  // @Transform((value) => {
  //   // console.log('HERE -> ', Date.now(), value.obj.room.id);
  //   // return plainToClass(RoomDto, value.obj?.room);
  //   return 'ee';
  // })
  // // room_id: RoomDto;
  // room: string;

  @ApiProperty()
  @Expose()
  body: string;

  @ApiProperty()
  @Expose()
  timestamp: number;
}
