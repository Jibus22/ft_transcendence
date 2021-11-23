import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';

export class editRelationDto {

	@IsUUID()
	id: string;

}
