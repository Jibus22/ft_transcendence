
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Exclude } from "class-transformer";

@Exclude()
export class UserDto {

	@ApiProperty()
	@Expose()
	id: string;

	@ApiProperty()
	@Expose()
	login: string;

	@ApiProperty()
	@Expose()
	@Transform(value => {
  if (value.obj.use_local_photo === false || value.obj.photo_url_local === null) {
    return value.obj.photo_url_42;
  }
	return value.obj.photo_url_local;
	})
	photo_url: string;

	// use_local_photo: boolean;
	// photo_url_42: string;
	// photo_url_local: string;

}
