import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateUserDto {

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	login: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	use_local_photo: boolean;
}
