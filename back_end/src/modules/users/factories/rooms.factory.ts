import { define } from 'typeorm-seeding';
import { Room } from '../../chat/entities/room.entity';

define(Room, () => {
  const room = new Room();
  room.is_private = Math.random() < 0.3 ? true : false;
  if (room.is_private === false && Math.random() < 0.2)
    room.password = 'password';
  return room;
});
