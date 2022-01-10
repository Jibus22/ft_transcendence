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

describe('CHAT: Restrictions', () => {
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
        RESTRICTIONS
  -------------------------------------------------------------------
  ===================================================================
  */

  it('ban a user ', async () => {
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
        return await chatHelper.addRestriction(cookies, returnedRoom.id, {
          user_id: targetParticipant.user.id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        const bannedParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(bannedParticipant).toBeUndefined();
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(0);
        expect(room.bans.length).toBe(1);
        expect(room.bans[0].id).toBe(targetParticipant.user.id);
      });
  });

  it('mute a user ', async () => {
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
        return await chatHelper.addRestriction(cookies, returnedRoom.id, {
          user_id: targetParticipant.user.id,
          restriction_type: 'mute',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        const mutedParticipant = participants.find(
          (p) => p.id === targetParticipant.id,
        );
        expect(mutedParticipant).toEqual(targetParticipant);
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.bans.length).toBe(0);
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(1);
        expect(room.mutes[0].id).toBe(targetParticipant.user.id);
      });
  });

  it('log as non moderator and try to mute/ban user', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;
    let tmpCookies: string[];

    await chatHelper
      .createSimpleRoom(room)
      .then(async () => {
        return await commons.logUser(users[2].login);
      })
      .then(async (response) => {
        tmpCookies = commons.getCookies(response);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        const returnedRoom: RoomDto = response.body[0];
        return await chatHelper.addRestriction(tmpCookies, returnedRoom.id, {
          user_id: users[1].id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        return await chatHelper.getAllRoomsAsSiteOwner();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const room: FullRoomDto = response.body[0];
        expect(room.bans).toBeDefined();
        expect(room.bans.length).toBe(0);
        expect(room.mutes).toBeDefined();
        expect(room.mutes.length).toBe(0);
      });
  });

  it('change participants to moderator, log under it, try to ban owner', async () => {
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };
    let targetParticipant: ParticipantDto;
    let targetRoom: RoomDto;
    let tmpCookies: string[];

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        targetRoom = response.body[0] as RoomDto;
        expect(targetRoom.participants.length).toBe(3);
        targetParticipant = targetRoom.participants.find(
          (p) => p.is_moderator === false,
        );
        expect(targetParticipant.is_moderator).toBe(false);
        return await chatHelper.updateModerators(cookies, targetRoom.id, {
          participant_id: targetParticipant.id,
          is_moderator: true,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        await commons
          .logUser(targetParticipant.user.login)
          .then((r) => (tmpCookies = commons.getCookies(r)));
        return await chatHelper.addRestriction(tmpCookies, targetRoom.id, {
          user_id: loggedUser.id,
          restriction_type: 'ban',
          duration: 2,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toHaveProperty(
          'error',
          'owner of the room cannot be banned',
        );
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const { participants } = response.body[0] as RoomDto;
        expect(participants.length).toBe(3);
      });
  });
}); // <<< end of describBlock
