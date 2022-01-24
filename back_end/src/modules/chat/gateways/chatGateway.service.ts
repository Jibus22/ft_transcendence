import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/users.entity';
import { Room } from '../entities/room.entity';
import { ChatGateway, messageType } from './chat.gateway';

@Injectable()
export class ChatGatewayService {
  constructor(private chatGateway: ChatGateway) {
    console.debug('CTO - chatgateway Service');
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS EMITERS
	-------------------------------------------------------------------
	===================================================================
	*/

  sendEventToServer(event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to SERVER: ', event);
    }
    return this.chatGateway.doSendEventToServer(event, message);
  }

  sendEventToRoom(room: Room | Room[], event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to ROOM: ', event);
    }
    const dest = Array.isArray(room) ? room.map((r) => r.id) : room.id;
    return this.chatGateway.doSendEventToRoom(dest, event, message);
  }

  sendEventToClient(user: User, event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to CLIENT: ', event);
    }
    return this.chatGateway.doSendEventToRoom(user.ws_id, event, message);
  }

  async makeClientJoinRoom(user: User, room: Room) {
    return await this.chatGateway.makeClientLeaveRoom(user, room);
  }
  async makeClientLeaveRoom(user: User, room: Room) {
    return await this.chatGateway.makeClientJoinRoom(user, room);
  }

  async allSockets() {
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
  //     console.log(true);
  //     await this.updateUser(client, {
  //       is_in_game: true,
  //     }).catch((error) => console.log(error));
  //   } else if (data.value === 'out') {
  //     console.log(false);
  //     await this.updateUser(client, {
  //       is_in_game: false,
  //     }).catch((error) => console.log(error));
  //   }
  // }
}
