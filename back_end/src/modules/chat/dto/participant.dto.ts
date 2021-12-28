import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { Participant } from '../entities/participant.entity';
import { RoomDto } from './room.dto';

@Exclude()
export class ParticipantDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.user);
  })
  user: UserDto;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(RoomDto, value.obj.room);
  })
  room: RoomDto;

  @ApiProperty()
  @Expose()
  is_owner: boolean;

  @ApiProperty()
  @Expose()
  is_moderator: boolean;
}
