import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { RoomDto } from './room.dto';

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

  @ApiProperty()
  @Expose()
  body: string;

  @ApiProperty()
  @Expose()
  timestamp: number;
}
