import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class ReportDto {

	@ApiProperty()
	@Expose()
	price: number;

	@ApiProperty()
	@Expose()
	make: string;

	@ApiProperty()
	@Expose()
	model: string;

	@ApiProperty()
	@Expose()
	year: number;

	@ApiProperty()
	@Expose()
	lng: number;

	@ApiProperty()
	@Expose()
	lat: number;

	@ApiProperty()
	@Expose()
	mileage: number;

	@Transform( ({obj}) => obj.user.id )
	@ApiProperty()
	@Expose()
	userId: number;

	@ApiProperty()
	@Expose()
	id: number;

	@ApiProperty({default: false})
	@Expose()
	approved: boolean;
}
