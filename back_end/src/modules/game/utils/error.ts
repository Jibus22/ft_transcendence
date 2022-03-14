import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { UserDto } from '../../users/dtos/user.dto';
import { User } from '../../users/entities/users.entity';

export interface IPlayerError {
  isBlocker(blockerList: UserDto[], players: UserDto[]): void;
  errorUserNotFound(elem: { user: User; login: string }): void;
  errorPlayerNotOnline(elem: UserDto): void;
  errorPlayerNotInGame(elem: UserDto): void;
  errorSamePlayer(usr: UserDto[]): void;
  isGameWs(elem: User): void;
}

export class PlayerHttpError implements IPlayerError {
  isBlocker(blockerList: UserDto[], players: UserDto[]) {
    if (blockerList.find((elem) => elem.id === players[0].id)) {
      throw new ForbiddenException(
        `Sadly ${players[1].login} blocked you... Try be nicer.`,
      );
    }
  }

  errorUserNotFound(elem: { user: User; login: string }) {
    if (!elem.user) {
      throw new NotFoundException(`${elem.login} not found`);
    }
  }

  errorPlayerNotOnline(elem: UserDto) {
    if (elem.status !== 'online') {
      throw new ForbiddenException(`${elem.login} is ${elem.status}, dumb`);
    }
  }

  errorPlayerOffline(elem: UserDto) {
    if (elem.status === 'offline') {
      throw new ForbiddenException(`${elem.login} is ${elem.status}, dumb`);
    }
  }

  errorPlayerNotInGame(elem: UserDto) {
    if (elem.status !== 'ingame') {
      throw new ForbiddenException(`${elem.login} is ${elem.status}`);
    }
  }

  errorSamePlayer(usr: UserDto[]) {
    if (usr[0].id === usr[1].id) {
      throw new ForbiddenException(
        `${usr[0].login} can't play against themself`,
      );
    }
  }

  isGameWs(elem: User) {
    if (!elem.game_ws) {
      throw new ForbiddenException(`game websocket of ${elem.login} not found`);
    }
  }
}

export class PlayerWsError implements IPlayerError {
  isBlocker(blockerList: UserDto[], players: UserDto[]) {
    if (blockerList.find((elem) => elem.id === players[0].id)) {
      throw new WsException(
        `Sadly ${players[1].login} blocked you... Try be nicer.`,
      );
    }
  }

  errorUserNotFound(elem: { user: User; login: string }) {
    if (!elem.user) {
      throw new NotFoundException(`${elem.login} not found`);
    }
  }

  errorPlayerNotOnline(elem: UserDto) {
    if (elem.status !== 'online') {
      throw new WsException(`${elem.login} is ${elem.status}, dumb`);
    }
  }

  errorPlayerNotInGame(elem: UserDto) {
    if (elem.status !== 'ingame') {
      throw new WsException(`${elem.login} is ${elem.status}`);
    }
  }

  errorSamePlayer(usr: UserDto[]) {
    if (usr[0].id === usr[1].id) {
      throw new WsException(`${usr[0].login} can't play against themself`);
    }
  }

  isGameWs(elem: User) {
    if (!elem.game_ws) {
      throw new WsException(`game websocket of ${elem.login} not found`);
    }
  }
}
