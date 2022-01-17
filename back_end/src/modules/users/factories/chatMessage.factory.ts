import { timestamp } from 'rxjs';
import { define } from 'typeorm-seeding';
import { ChatMessage } from '../../chat/entities/chatMessage.entity';

var faker = require('faker');
faker.locale = 'en_US';

define(ChatMessage, () => {
  const chatMessage = new ChatMessage();
  chatMessage.timestamp =
    faker.time.recent() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365);
  const randomVal = Math.floor(Math.random() * 100);
  chatMessage.body =
    randomVal % 34 === 0
      ? '🤣'
      : randomVal % 33 === 0
      ? '✅'
      : randomVal % 32 === 0
      ? '🐱 🔥'
      : randomVal % 15 === 0
      ? faker.animal.type()
      : randomVal % 7 === 0
      ? faker.lorem.paragraphs()
      : randomVal % 4 === 0
      ? faker.company.catchPhrase()
      : randomVal % 2 === 0
      ? faker.lorem.sentences()
      : faker.lorem.words();
  return chatMessage;
});
