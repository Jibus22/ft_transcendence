import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class editRelationDto {

	@ApiProperty()
	@IsUUID()
	id: string;

}
