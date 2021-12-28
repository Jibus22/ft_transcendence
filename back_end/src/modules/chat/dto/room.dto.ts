import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
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

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(ParticipantDto, value.obj.participants);
  })
  participants: ParticipantDto[];

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return plainToClass(ChatMessageDto, value.obj.messages);
  })
  messages: ChatMessageDto[];
}
