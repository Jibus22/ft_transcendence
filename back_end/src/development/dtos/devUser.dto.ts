
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Exclude } from "class-transformer";
import { User } from "../../users/entities/users.entity";

@Exclude()
export class devUserDto {

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

	@ApiProperty()
	@Expose()
	friends: User[];

	@ApiProperty()
	@Expose()
	photo_url_42: string;

	@ApiProperty()
	@Expose()
	photo_url_local: string;

	@ApiProperty()
	@Expose()
	use_local_photo: boolean;



}
