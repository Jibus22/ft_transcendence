import { IsUUID } from 'class-validator';
// import { User } from '../../users/entities/users.entity';

// without class-validator (ex: @IsUUID), data don't pass in 'create' route:
// they're all printed as 'undefined' and 'ormrepo.save()' has an error bc
// fields are NULL
// And if 'create' route take 'any' object instead of this dto, any data of
// any type pass thru and this is an issue.

export class CreateGameDto {
  @IsUUID()
  uuidP1: string;
  @IsUUID()
  uuidP2: string;
}
