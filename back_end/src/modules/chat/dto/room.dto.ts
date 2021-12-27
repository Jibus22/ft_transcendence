import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToClass, Transform } from "class-transformer";
import { Participant } from "../entities/participant.entity";
import { ParticipantDto } from "./participant.dto";

@Exclude()
export class RoomDto {

	@ApiProperty()
	@Expose()
	id: string;

	@ApiProperty()
	@Expose()
  @Transform((value) => {
    return plainToClass(Participant, value.obj.participants);
  })
	participants: ParticipantDto[];

	// @ApiProperty()
	// @Expose()
  // @Transform((value) => {
  //   return plainToClass(UserDto, value.obj.participants);
  // })
	// participants: UserDto[];

	// @ApiProperty()
	// @Expose()
  // @Transform((value) => {
	// 	const participants: Participant[] = value.obj.participants;
  //   return plainToClass(UserDto, participants.filter((user) => user.is_moderator));
  // })
	// moderators: UserDto[];

	// @Expose()
  // @Transform((value) => {
  //   return plainToClass(UserDto, value.obj.participants);
  // })
	// bans: Ban[];

	// @ApiProperty()
	// @Expose()
  // @Transform((value) => {
	// 	const participants: Participant[] = value.obj.participants;
  //   return plainToClass(UserDto, participants.find((user) => user.is_owner));
  // })
	// owner: UserDto;

	@ApiProperty()
	@Expose()
	is_private: boolean;

	@ApiProperty()
	@Expose()
	@Transform((value): boolean  => {
		return (value.obj.password && value.obj.password.length) ? true : false;
	})
	is_password_protected: boolean;
}
