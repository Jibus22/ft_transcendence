import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from '../chat.service';
import { Room } from '../entities/room.entity';

declare global {
  namespace Express {
    interface Request {
      targetedRoom?: Room;
    }
  }
}

@Injectable()
export class TargetedRoomMiddleware implements NestMiddleware {
  constructor(private readonly chatService: ChatService) {}

  async use(req: Request, res: Response, next: Function) {
    const currentUser = req.currentUser;
    const targetedRoomId = req.params.room_id;

    const logger = new Logger(' 🛠 💬  Chat Middlewear');

    if (currentUser && targetedRoomId) {
      await this.chatService
        .findOneWithRelations(targetedRoomId)
        .then((room) => {
          req.targetedRoom = room;
          logger.log(`Room targeted: ${req.targetedRoom.id}`); // TODO remove debug
        })
        .catch((error) => {
          logger.log('Could not find Room targeted: ', error); // TODO remove debug
        });
    } else {
      if (!currentUser) logger.log('No user id in session')
      if (!targetedRoomId) logger.log('No targeted room request');
    }

    next();
  }
}
