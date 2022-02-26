import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateIsPrivateDto {
  @ApiProperty()
  @IsBoolean()
  is_private: boolean;
}
