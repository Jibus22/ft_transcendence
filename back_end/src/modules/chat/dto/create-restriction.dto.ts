import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateRestrictionDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  restriction_type: 'ban' | 'mute';

  @ApiProperty()
  @Min(1)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  duration: number;
}
