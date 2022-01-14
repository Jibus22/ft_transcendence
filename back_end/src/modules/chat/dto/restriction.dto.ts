import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { Room } from '../entities/room.entity';

@Exclude()
export class RestrictionDto {
  @ApiProperty()
  @Expose()
  user: User;

  @ApiProperty()
  @Expose()
  room: Room;

  @ApiProperty()
  @Expose()
  restriction_type: 'ban' | 'mute';
}
