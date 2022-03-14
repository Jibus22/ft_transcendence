import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { Restriction } from '../entities/restriction.entity';
import { ChatMessageDto } from './chatMessade.dto';
import { ParticipantDto } from './participant.dto';

@Exclude()
export class RoomDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  is_private: boolean;

  @ApiProperty()
  @Expose()
  @Transform((value): boolean => {
    return value.obj.password && value.obj.password.length ? true : false;
  })
  is_password_protected: boolean;

  @ApiProperty({ type: [ParticipantDto], isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(ParticipantDto, value.obj.participants);
  })
  participants: ParticipantDto[];
}

/*
  ===================================================================
  -------------------------------------------------------------------
        FOR SITE OWNER ONLY
  -------------------------------------------------------------------
  ===================================================================
  */

@Exclude()
export class RoomWithRestrictionsDto extends RoomDto {
  @ApiProperty()
  @Expose()
  @Transform((value) => {
    const output: Restriction[] = value.obj?.restrictions;
    if (output) {
      return plainToClass(
        UserDto,
        output.filter((r) => r.restriction_type === 'ban').map((r) => r.user),
      );
    }
  })
  bans: UserDto[];

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    const output: Restriction[] = value.obj?.restrictions;
    if (output) {
      return plainToClass(
        UserDto,
        output.filter((r) => r.restriction_type === 'mute').map((r) => r.user),
      );
    }
  })
  mutes: UserDto[];
}

/*
  ===================================================================
  -------------------------------------------------------------------
        FOR ROOM PARTICIPANTS
  -------------------------------------------------------------------
  ===================================================================
  */

@Exclude()
export class RoomWithMessagesDto extends RoomDto {
  @ApiProperty({ type: [ChatMessageDto], isArray: true })
  @Expose()
  @Transform((value) => {
    return plainToClass(ChatMessageDto, value.obj.messages);
  })
  messages: ChatMessageDto[];
}
