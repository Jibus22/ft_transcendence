import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateRestrictionDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  restriction_type: 'ban' | 'mute';

  @ApiProperty()
  // VALIDATION FOR DATE FORMAT TBD
  // @IsDate()
  @IsNumber()
  expiration_time: number;
}
