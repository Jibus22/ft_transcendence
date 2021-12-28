import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  login: string;

  @IsString()
  login_42: string;

  @IsString()
  photo_url_42: string;
}
