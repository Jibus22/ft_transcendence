
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Exclude } from "class-transformer";
import { User } from "../entities/users.entity";
import { UserDto } from "./user.dto";

@Exclude()
export class OwnInfoUserDto {

	@ApiProperty()
	@Expose()
	id: string;

	@ApiProperty()
	@Expose()
	login: string;

	@ApiProperty()
	@Expose()
	login_42: string;

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
	@Transform(value => {
		return value.obj.friends;
	})
	@Expose()
	friends_list: UserDto[];

	@ApiProperty()
	@Transform(value => {
		return value.obj.blockedAccounts;
	})
	@Expose()
	blocked_list: UserDto[];
}
