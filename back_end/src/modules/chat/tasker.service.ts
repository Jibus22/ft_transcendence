import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { ChatService } from './chat.service';

@Injectable()
export class TaskerService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly chatService: ChatService,
  ) {}


  // @Cron(CronExpression.EVERY_5_SECONDS)
  @Cron('*/3 * * * * *')
  async cleanExpiredRestrictions() {
    const logger = new Logger('Takser');

    const expired = await this.chatService
    .getRestrictions()
    .then((restrictions) => {
      return this.chatService.extractExpiredRestrictions(restrictions);
    })
    .catch((error) => logger.log(error));

    if (!expired || !expired.length) return;

    await this.chatService.removeRestrictions(expired);

  }
}
