import { randomUUID } from 'crypto';
import { define } from 'typeorm-seeding';
import { User } from '../entities/users.entity';

var faker = require('faker');

define(User, () => {
  const user = new User();
  user.login = (faker.internet.userName() as string).slice(-10);
  user.login_42 = user.login;
  user.photo_url_42 = `https://avatars.dicebear.com/api/human/${randomUUID()}.svg`;
  user.ws_id = (Math.random() > 0.5) ? (faker.datatype.uuid()) : undefined;
  console.log(user);
  return user;
});
