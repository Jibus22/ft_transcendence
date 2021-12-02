
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToClass, Transform } from "class-transformer";
import { UserDto } from "./user.dto";

@Exclude()
export class privateUserDto extends UserDto {

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
