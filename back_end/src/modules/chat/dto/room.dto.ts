import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToClass, Transform } from "class-transformer";
import { UserDto } from "../../users/dtos/user.dto";

@Exclude()
export class RoomDto {

	@ApiProperty()
	@Expose()
	id: string;

	@ApiProperty()
	@Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.participants);
  })
	participants: UserDto[];

	@ApiProperty()
	@Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.participants);
  })
	moderators: UserDto[];

	// @Expose()
  // @Transform((value) => {
  //   return plainToClass(UserDto, value.obj.participants);
  // })
	// bans: Ban[];

	@ApiProperty()
	@Expose()
  @Transform((value) => {
    return plainToClass(UserDto, value.obj.owner);
  })
	owner: UserDto;

	@ApiProperty()
	@Expose()
	is_private: boolean;

	@ApiProperty()
	@Expose()
	@Transform((value): boolean  => {
		return value.obj.password ? true : false;
	})
	is_password_protected: boolean;
}
