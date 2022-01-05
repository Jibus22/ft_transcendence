import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

@ApiExtraModels()
export class UpdateParticipantDto {
  @ApiProperty()
  @IsUUID()
  participant_id: string;

  @ApiProperty()
  @IsBoolean()
  is_moderator: boolean;
}
