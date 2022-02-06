import { ApiExcludeEndpoint, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { UserDto } from '../../users/dtos/user.dto';
import { RoomDto } from './room.dto';

@Exclude()
export class roomPasswordDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  password?: string;
}
