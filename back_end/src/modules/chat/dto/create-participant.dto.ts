import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

@ApiExtraModels()
export class CreateParticipantDto {

	@ApiProperty()
	@IsUUID()
	id: string;
}
