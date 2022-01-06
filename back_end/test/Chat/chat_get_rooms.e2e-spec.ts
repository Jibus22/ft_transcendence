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

describe('CHAT: Get Rooms', () => {
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
  Get PUBLIC All Rooms
  -------------------------------------------------------------------
  ===================================================================
  */

  it('get only public rooms', async () => {
    let createdRooms: RandomRoom[];

    await chatHelper
      .generateManyRandomRoomsForRandomUsers(nbOfRooms)
      .then(async (rooms: RandomRoom[]) => {
        createdRooms = rooms;
        expect(createdRooms.length).toEqual(nbOfRooms);
        expect(loggedUser.id).toBeDefined();
        expect(loggedUser.id.length).toBeGreaterThan(0);
        return await chatHelper.getPublicRooms();
      })
      .then(async (response) => {
        const returnedRooms: RoomDto[] = response.body;
        const expectedRooms: RandomRoom[] = createdRooms.filter(
          (room: RandomRoom) => {
            return room.is_private === false;
          },
        );
        expect(returnedRooms.length).toBe(expectedRooms.length);
        const privateRooms = returnedRooms.filter((r) => r.is_private === true);
        expect(privateRooms.length).toBe(0);
      });
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
  Get All Rooms
  -------------------------------------------------------------------
  ===================================================================
  */

  it('get list of all sites rooms', async () => {
    const rooms = [
      {
        participants: [{ login: users[1].login }, { id: users[2].id }],
        is_private: true,
      },
      {
        participants: [{ login: users[2].login }, { id: users[2].id }],
        is_private: false,
      },
      {
        participants: [{ id: users[4].id }],
        password: 'testPassword',
        is_private: false,
      },
      {
        participants: users,
        password: null,
        is_private: false,
      },
    ];

    for (let i = 0; i < rooms.length; i++) {
      await chatHelper.createSimpleRoom(rooms[i]);
    }

    await chatHelper.getAllRooms().then((response) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(typeof response.body).toBe('object');
      expect(response.body.length).toBe(rooms.length);
      response.body.forEach((element, index) => {
        expect(element).toHaveProperty(
          'is_password_protected',
          rooms[index].password ? true : false,
        );
        expect(typeof element.is_password_protected).toBe('boolean');
        expect(element).toHaveProperty('is_private', rooms[index].is_private);
        const owner = element.participants.filter(
          (p) => p.user.id === loggedUser.id && p.is_owner === true,
        );
        expect(owner.length).toBe(1);
      });
    });
  });

}); // <<< end of describBlock
