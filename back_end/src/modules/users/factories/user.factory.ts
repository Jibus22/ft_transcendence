import { define } from 'typeorm-seeding';
import { User } from '../entities/users.entity';

define(User, () => {
  const user = new User();
  // user.login_42 = 'bvalette';
  // user.photo_url_42 = '';
  // user.use_local_photo = false
  // console.log('user ready for seed', user);
  return user;
});
