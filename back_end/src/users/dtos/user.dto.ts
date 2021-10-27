
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UserDto {

	@ApiProperty()
	@Expose()
	id: number;

	@ApiProperty()
	@Expose()
	email: string;
}
