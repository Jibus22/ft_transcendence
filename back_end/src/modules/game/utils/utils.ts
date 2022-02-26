import { plainToClass } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { OnlineGameDto } from '../dto/online-game.dto';

const myPtC = (dto: any) => (plain: any) =>
  plainToClass(dto, plain, {
    excludeExtraneousValues: true,
  });

export const myPtoUserDto = myPtC(UserDto);
export const myPtoOnlineGameDto = myPtC(OnlineGameDto);

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
