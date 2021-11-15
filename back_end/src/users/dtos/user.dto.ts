
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Exclude } from "class-transformer";
import { User } from "../entities/users.entity";

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

	@ApiProperty()
	@Expose()
	friends: User[];
}
