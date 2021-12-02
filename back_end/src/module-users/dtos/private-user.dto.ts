
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToClass, Transform } from "class-transformer";
import { UserDto } from "./user.dto";

// TODO make privateUserDto expend UserDto to avoid repeating code

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
		console.log('TRANSFORM DTO', value.obj);
		if (value.obj.use_local_photo === false || value.obj.photo_url_local === null) {
			return value.obj.photo_url_42;
		}
		return value.obj.photo_url_local.fileName;
	})
	photo_url: string;

	@ApiProperty({ type: UserDto, isArray: true })
	@Expose()
	@Transform(value => {
		return plainToClass(UserDto, value.obj.friends_list);
	})
	friends_list: UserDto[];

	@ApiProperty({ type: UserDto, isArray: true })
	@Expose()
	@Transform(value => {
		return plainToClass(UserDto, value.obj.blocked_list);
	})
	blocked_list: UserDto[];
}
