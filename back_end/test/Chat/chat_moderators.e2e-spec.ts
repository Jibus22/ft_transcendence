import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ChatMessageDto } from '../../src/modules/chat/dto/chatMessade.dto';
import { createMessageDto } from '../../src/modules/chat/dto/create-message.dto';
import { ParticipantDto } from '../../src/modules/chat/dto/participant.dto';
import { FullRoomDto, RoomDto } from '../../src/modules/chat/dto/room.dto';
import { Participant } from '../../src/modules/chat/entities/participant.entity';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers, RandomRoom } from './helpers';
var faker = require('faker');

describe('CHAT: Moderators', () => {
  const nbOfRooms = 25;
  let app: INestApplication;
  let chatHelper: ChatHelpers;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    commons = new CommonTest(app);

    loggedUser = commons.testUserBatch[0];
    await app.init();

    users = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {
        console.log(error);
      });
    expect(users.length).toEqual(commons.testUserBatch.length);

    cookies = await commons.logUser(loggedUser.login).then((response) => {
      loggedUser.id = response.body.id;
      return commons.getCookies(response);
    });
    expect(cookies.length).toBeGreaterThanOrEqual(1);
    chatHelper = new ChatHelpers(cookies, loggedUser, app, users, commons);
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        MODERATORS MANAGEMENT
  -------------------------------------------------------------------
  ===================================================================
  */

  it('change participants to moderator then back to regulat participant', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, returnedRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('is_moderator', true);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { id: roomId, participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(true);
        return await chatHelper.updateModerators(cookies, roomId, {
          participant_id: targetParticipant.id,
          is_moderator: false,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('is_moderator', false);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(false);
      });
  });

  it('try to change non existing participant', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, returnedRoom.id, {
          participant_id: targetParticipant.id + 'nonexisting',
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('try to change participant with wrong room_id', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(
          cookies,
          returnedRoom.id + 'nonexisting',
          {
            participant_id: targetParticipant.id,
            is_moderator: true,
          },
        );
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('try to change participant in room not owned', async () => {
    let targetParticipant: ParticipantDto;

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (response) => {
        expect(response.length).toBe(nbOfRooms);
        return await chatHelper.getParticipatingNotOwnedRooms();
      })
      .then(async (rooms) => {
        expect(rooms.length).not.toBe(0);

        const targetParticipant = rooms[0].participants.find(
          (p) => p.is_moderator === false,
        );

        return await chatHelper.updateModerators(
          cookies,
          targetParticipant.id,
          {
            participant_id: targetParticipant.id,
            is_moderator: true,
          },
        );
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('log as non owner and try change participants to moderator', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom = response.body[0] as RoomDto;
        expect(returnedRoom.participants.length).toBe(3);
        targetParticipant = returnedRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);

        const tmpCookies = await commons
          .logUser(users[2].login)
          .then((r) => commons.getCookies(r));

        return await chatHelper.updateModerators(tmpCookies, returnedRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        targetParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(targetParticipant.is_moderator).toBe(false);
      });
  });

}); // <<< end of describBlock
