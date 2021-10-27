import { IsNumber, IsString, Min, Max, IsLongitude, IsLatitude } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetEstimateDto {

	// we won't receive a price as this it what we look for
	// @IsNumber()
	// @Min(0)
	// @Max(1000000)
	// price: number;

	@IsString()
	make: string;

	@IsString()
	model: string;

	@Transform( ( {value} ) => parseInt(value))
	@IsNumber()
	@Min(1930)
	@Max(2050)
	year: number;

	@Transform( ( {value} ) => parseInt(value))
	@IsLongitude()
	lng: number;

	@Transform( ( {value} ) => parseFloat(value))
	@IsLatitude()
	lat: number;

	@Transform( ( {value} ) => parseFloat(value))
	@IsNumber()
	@Min(0)
	@Max(1000000)
	mileage: number;
}
