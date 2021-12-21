import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";
import { User } from "src/modules/users/entities/users.entity";

export class CreateRoomDto {

	@ApiProperty()
	@IsArray()
	participants: Partial<User>[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	password: string;

	@ApiProperty()
	@IsBoolean()
	is_private: boolean;
}
