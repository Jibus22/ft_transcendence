import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class AddFriendDto {

	@IsString()
	id: string;

}
