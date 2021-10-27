import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsString, IsOptional } from "class-validator";

export class UpdateUserDto {

	@ApiPropertyOptional()
	@IsEmail()
	@IsOptional()
	email: string;


	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	password: string;
}
