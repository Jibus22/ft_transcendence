import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class authTokenDto {
  @ApiProperty()
  @IsString()
  @Length(6)
  token: string;
}
