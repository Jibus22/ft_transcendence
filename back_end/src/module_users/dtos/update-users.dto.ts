import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	login: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	photo_url_local: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	use_local_photo: boolean;
}
