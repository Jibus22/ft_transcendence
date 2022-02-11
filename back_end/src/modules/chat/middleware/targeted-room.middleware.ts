import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from '../chat.service';
import { Restriction } from '../entities/restriction.entity';
import { Room } from '../entities/room.entity';

declare global {
  namespace Express {
    interface Request {
      targetedRoom?: Room;
      targetedRoomActiveBan?: Restriction[];
      targetedRoomActiveMute?: Restriction[];
    }
  }
}

@Injectable()
export class TargetedRoomMiddleware implements NestMiddleware {
  constructor(private readonly chatService: ChatService) {}

  async use(req: Request, res: Response, next: Function) {
    const currentUser = req.currentUser;
    const targetedRoomId = req.params?.room_id;

    const logger = new Logger(' 🛠 💬  Chat Middlewear');
    if (currentUser && targetedRoomId) {
      await this.chatService
        .findOneWithParticipantsAndRestrictions(targetedRoomId)
        .then((room) => {
          req.targetedRoom = room;
          req.targetedRoomActiveBan = this.chatService.extractValidRestrictions(
            room,
            'ban',
          );
          req.targetedRoomActiveMute =
            this.chatService.extractValidRestrictions(room, 'mute');
          logger.debug(`Room targeted: ${req?.targetedRoom?.id}`);
        })
        .catch((error) => {
          logger.debug('Could not find Room targeted: ', error);
        });
    } else {
      if (!targetedRoomId) logger.debug('No targeted room request');
      if (!currentUser) logger.debug('No user id in session');
    }

    next();
  }
}
