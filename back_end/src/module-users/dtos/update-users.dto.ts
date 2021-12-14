import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateUserDto {

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	login: string;

	@ApiPropertyOptional() 			// TODO remove is upload of picture is done in backend
	@IsOptional()
	@IsUrl()
	photo_url_local: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	use_local_photo: boolean;
}
