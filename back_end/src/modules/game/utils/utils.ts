import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { User } from 'src/modules/users/entities/users.entity';

export function isBlocker(blockerList: UserDto[], players: UserDto[]) {
  if (blockerList.find((elem) => elem.id === players[0].id)) {
    throw new ForbiddenException(
      `Sadly ${players[1].login} blocked you... Try be nicer.`,
    );
  }
}

export function errorUserNotFound(elem: { user: User; login: string }) {
  if (!elem.user) {
    throw new NotFoundException(`${elem.login} not found`);
  }
}

export function errorPlayerNotOnline(elem: UserDto) {
  if (elem.status !== 'online') {
    throw new ForbiddenException(`${elem.login} is ${elem.status}, dumb`);
  }
}

export function errorPlayerNotInGame(elem: UserDto) {
  if (elem.status !== 'ingame') {
    throw new ForbiddenException(`${elem.login} is ${elem.status}`);
  }
}

export function errorSamePlayer(usr: UserDto[]) {
  if (usr[0].id === usr[1].id) {
    throw new ForbiddenException(`${usr[0].login} can't play against themself`);
  }
}

export function isGameWs(elem: User) {
  if (!elem.game_ws) {
    throw new ForbiddenException(`game websocket of ${elem.login} not found`);
  }
}
