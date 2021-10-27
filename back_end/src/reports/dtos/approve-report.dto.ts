import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ApprovedReportDto {

	@ApiProperty()
	@IsBoolean()
	approved: boolean;
}
