import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, plainToClass, Transform } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";
import { UserDto } from "src/modules/users/dtos/user.dto";
import { User } from "src/modules/users/entities/users.entity";

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
    return plainToClass(UserDto, value.obj.owner);
  })
	owner: UserDto[];

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
