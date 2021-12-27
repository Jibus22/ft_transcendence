import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserDto } from "../../users/dtos/user.dto";
import { RoomDto } from "./room.dto";

@Exclude()
export class ParticipantDto {

	@ApiProperty()
	@Expose()
  id: string;

	@ApiProperty()
	@Expose()
  user: UserDto;

	@ApiProperty()
	@Expose()
  room: RoomDto;

	@ApiProperty()
	@Expose()
  is_owner: boolean;

	@ApiProperty()
	@Expose()
  is_moderator: boolean;

}
