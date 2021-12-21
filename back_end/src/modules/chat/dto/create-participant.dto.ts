import { ApiExtraModels, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

@ApiExtraModels()
export class CreateParticipantDto {

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	id: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	login: string;

}
