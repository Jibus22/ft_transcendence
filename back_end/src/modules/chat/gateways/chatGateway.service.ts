import { Injectable, Logger } from '@nestjs/common';
import { User } from '../../users/entities/users.entity';
import { Room } from '../entities/room.entity';
import { ChatGateway, Events, messageType } from './chat.gateway';

@Injectable()
export class ChatGatewayService {
  constructor(private chatGateway: ChatGateway) {
  }

  private readonly logger = new Logger(ChatGatewayService.name);

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS EMITERS
	-------------------------------------------------------------------
	===================================================================
	*/

  sendEventToServer(event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug('Emit event to SERVER: ', event);
    }
    return this.chatGateway.doSendEventToServer(event, message);
  }

  sendEventToRoom(room: Room | Room[], event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug('Emit event to ROOM: ', event);
    }
    if (room) {
      const dest = Array.isArray(room) ? room.map((r) => r.id) : room.id;
      return this.chatGateway.doSendEventToRoom(dest, event, message);
    }
  }

  sendEventToClient(user: User, event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug('Emit event to CLIENT: ', event);
    }
    return this.chatGateway.doSendEventToRoom(user.ws_id, event, message);
  }

  async makeClientJoinRoom(user: User, room: Room) {
    return await this.chatGateway.makeClientJoinRoom(user, room);
  }

  async makeClientLeaveRoom(user: User, room: Room) {
    return await this.chatGateway.makeClientLeaveRoom(user, room);
  }

  async allSockets() {
    (await this.chatGateway.server.fetchSockets()).forEach(s => s.emit(Events.NEW_MESSAGE, 'coucou' ));
    return this.chatGateway.server.sockets;
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS LISTENNERS
	-------------------------------------------------------------------
	===================================================================
	*/

  // async setUserIngame(client: Socket, data: { value: 'in' | 'out' }) {
  //   if (data.value === 'in') {
  //     this.logger.debug(true);
  //     await this.updateUser(client, {
  //       is_in_game: true,
  //     }).catch((error) => this.logger.debug(error));
  //   } else if (data.value === 'out') {
  //     this.logger.debug(false);
  //     await this.updateUser(client, {
  //       is_in_game: false,
  //     }).catch((error) => this.logger.debug(error));
  //   }
  // }
}
