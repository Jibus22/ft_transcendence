import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, Max, IsLongitude, IsLatitude } from 'class-validator';

export class CreateReportDto {

	@ApiProperty()
	@IsNumber()
	@Min(0)
	@Max(1000000)
	price: number;

	@ApiProperty()
	@IsString()
	make: string;

	@ApiProperty()
	@IsString()
	model: string;

	@ApiProperty()
	@IsNumber()
	@Min(1930)
	@Max(2050)
	year: number;

	@ApiProperty()
	@IsLongitude()
	lng: number;

	@ApiProperty()
	@IsLatitude()
	lat: number;

	@ApiProperty()
	@IsNumber()
	@Min(0)
	@Max(1000000)
	mileage: number;
}
