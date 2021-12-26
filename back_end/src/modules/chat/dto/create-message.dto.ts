import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";
import { CreateParticipantDto } from "./create-participant.dto";

export class createMessageDto {

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	message: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	password: string;
}
