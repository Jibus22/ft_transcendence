import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Exclude } from 'class-transformer';
import { User } from '../entities/users.entity';

@Exclude()
export class UserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  login: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj.use_local_photo === false || !value.obj.local_photo) {
      return value.obj.photo_url_42;
    }
    return (
      process.env.USERS_PHOTOS_SERVE_ROUTE + value.obj.local_photo.fileName
    );
  })
  photo_url: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    if (value.obj.status_online && value.obj.status_ingame) {
      return 'ingame';
    } else if (value.obj.status_online) {
      return 'online';
    } else {
      return 'offline';
    }
  })
  status: string;
}
