import { randomUUID } from 'crypto';
import { define } from 'typeorm-seeding';
import { User } from '../entities/users.entity';

var faker = require('faker');

define(User, () => {
  const user = new User();
  user.login = faker.internet.userName();
  user.login_42 = user.login;
  user.photo_url_42 = `https://avatars.dicebear.com/api/human/${randomUUID()}.svg`;
  console.log(user);
  return user;
});
