import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ChatService } from '../../src/modules/chat/chat.service';
import { ChatMessageDto } from '../../src/modules/chat/dto/chatMessade.dto';
import { createMessageDto } from '../../src/modules/chat/dto/create-message.dto';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';
import { ChatHelpers, RandomRoom } from './helpers';
var faker = require('faker');

describe('CHAT: Messages Creation', () => {
  const nbOfRooms = 25;
  let app: INestApplication;
  let chatHelper: ChatHelpers;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser: Partial<User>;
  let getNowValue: number;
  let getNowMock: jest.SpyInstance;

  beforeEach(async () => {
    getNowValue = Date.now();
    getNowMock = jest
      .spyOn(ChatService.prototype, 'getNow')
      .mockImplementation(() => getNowValue);

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
        MESSAGES
  -------------------------------------------------------------------
  ===================================================================
  */

  it('post a message to a room owned by user, and fetch it', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();
    let destRoom: RandomRoom;

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        destRoom = createdRooms.find(
          (r) => r.owner_created.id === loggedUser.id,
        );
        return await chatHelper.postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('sender.id', loggedUser.id);
        expect(response.body).toHaveProperty('body', testMessage);
        expect(response.body).toHaveProperty('timestamp');
        return await chatHelper.getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const messages: ChatMessageDto[] = response.body;
        expect(messages).toHaveLength(1);
        expect(messages[0]).toHaveProperty('body', testMessage);
        expect(messages[0]).toHaveProperty('sender.id', loggedUser.id);
        expect(messages[0]).toHaveProperty('timestamp');
      });
  });

  it('post MANY messages, and fetch them', async () => {
    let createdRoom: RoomDto;

    const randomMessages: createMessageDto[] = [];
    while (randomMessages.length < 100) {
      randomMessages.push({ body: faker.lorem.text() as string });
    }
    const room = {
      participants: [{ id: users[1].id }, { id: users[2].id }],
      is_private: true,
    };

    await chatHelper
      .createSimpleRoom(room)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        createdRoom = response.body;
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        await Promise.all(
          randomMessages.map(async (message) => {
            await chatHelper
              .postMessages(cookies, createdRoom.id, message)
              .then(async (response) => {
                expect(response.status).toBe(HttpStatus.CREATED);
                expect(response.body).toHaveProperty('body', message.body);
                expect(response.body).toHaveProperty(
                  'sender.id',
                  loggedUser.id,
                );
                expect(response.body).toHaveProperty('timestamp');
              });
          }),
        );

        return await chatHelper.getRoomMessages(cookies, createdRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        const returnedMessages: ChatMessageDto[] = response.body;
        expect(returnedMessages).toHaveLength(randomMessages.length);
        returnedMessages.map((message, index) => {
          expect(message).toHaveProperty('body', randomMessages[index].body);
        });
      });
  });

  it('try to POST message to a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const destRoom = createdRooms.find(
          (r) =>
            r.owner_created.id !== loggedUser.id &&
            !r.participants.some((p) => p.id === loggedUser.id),
        );
        return await chatHelper.postMessages(cookies, destRoom.id, {
          body: testMessage,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('try to GET message a room NOT owned NOR participant of', async () => {
    let createdRooms: RandomRoom[];
    let testMessage: string = faker.lorem.paragraph();

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);

        const destRoom = createdRooms.find(
          (r) =>
            r.owner_created.id !== loggedUser.id &&
            !r.participants.some((p) => p.id === loggedUser.id),
        );
        return await chatHelper.getRoomMessages(cookies, destRoom.id);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES RESTRICTIONS
  -------------------------------------------------------------------
  ===================================================================
  */

  it('try to POST a message after being MUTED', async () => {
    let createdRooms: RandomRoom[];
    let targetRoom: RoomDto;
    const targetPoster = users[1];
    const testSize = 1;
    const restrictionDuration = 10;
    let tmpCookies: string[];

    await chatHelper
      .generateManyRandomRoomsForLoggedUser(testSize, 1, 1, 0)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(testSize);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await chatHelper.getUserRooms();
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.length).toBe(testSize);
        targetRoom = response.body[0];
        expect(
          targetRoom.participants.some(
            (p) => p.user.login === targetPoster.login,
          ),
        ).toBeDefined();
        return await chatHelper.addRestriction(cookies, targetRoom.id, {
          user_id: targetPoster.id,
          restriction_type: 'mute',
          duration: restrictionDuration,
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        return await commons.logUser(targetPoster.login);
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        tmpCookies = commons.getCookies(response);
        return await chatHelper.postMessages(tmpCookies, targetRoom.id, {
          body: faker.lorem.paragraph(),
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        /*
         ** Change getNow returned value to emulate time passing and ban expiring
         */
        getNowValue = Date.now() + 1000 * 60 * (restrictionDuration + 1);
        return await chatHelper.postMessages(tmpCookies, targetRoom.id, {
          body: faker.lorem.paragraph(),
        });
      })
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(getNowMock).toHaveBeenCalled();
      });
  });
}); // <<< end of describBlock
