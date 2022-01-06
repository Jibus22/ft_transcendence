import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class createMessageDto {
  @ApiProperty()
  @IsString()
  @Length(1, 10000)
  body: string;
}
