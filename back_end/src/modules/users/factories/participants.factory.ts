import { define } from 'typeorm-seeding';
import { Participant } from '../../chat/entities/participant.entity';

define(Participant, () => {
  const participant = new Participant();
  if (Math.random() < 0.2) participant.is_moderator = true;
  participant.is_owner = false;
  return participant;
});
