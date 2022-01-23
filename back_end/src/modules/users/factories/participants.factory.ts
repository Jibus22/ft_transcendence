import { define } from 'typeorm-seeding';
import { Participant } from '../../chat/entities/participant.entity';

define(Participant, () => {
  const participant = new Participant();
  participant.is_moderator = Math.random() < 0.2 ? true : false;
  participant.is_owner = false;
  return participant;
});
