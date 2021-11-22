
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";
import { UserDto } from "./user.dto";

@Exclude()
export class privateUserDto {

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

	@ApiProperty({ type: UserDto })
	@Expose()
	@Transform(value => {
		return plainToInstance(UserDto, value.obj.friends_list);
	})
	friends_list: UserDto[];

	@ApiProperty({ type: UserDto })
	@Expose()
	@Transform(value => {
		return plainToInstance(UserDto, value.obj.blocked_list);
	})
	blocked_list: UserDto[];
}
