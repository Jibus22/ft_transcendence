import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createMessageDto } from '../../src/modules/chat/dto/create-message.dto';
import { CreateRestrictionDto } from '../../src/modules/chat/dto/create-restriction.dto';
import { CreateRoomDto } from '../../src/modules/chat/dto/create-room.dto';
import { RoomDto } from '../../src/modules/chat/dto/room.dto';
import { UpdateParticipantDto } from '../../src/modules/chat/dto/update-participant.dto';
import { User } from '../../src/modules/users/entities/users.entity';
import { CommonTest } from '../helpers';

var faker = require('faker');

export class CreatedParticipant {
  id: string;
}

export class RandomRoom {
  id: string;
  owner_created: CreatedParticipant;
  participants: CreatedParticipant[];
  is_private: boolean;
  password: string;
}

export class ChatHelpers {
  constructor(
    private cookies: string[],
    private loggedUser: Partial<User>,
    private app: INestApplication,
    private users: User[],
    private commons: CommonTest,
  ) {}

  async getJoinedRooms() {
    return await this.getUserRooms().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some(
          (p) => p.user.id === this.loggedUser.id && p.is_owner === false,
        ),
      );
    });
  }

  async getAllUnjoinedRooms() {
    return await this.getAllRoomsAsSiteOwner().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some(
          (p) => !r.participants.some((p) => p.user.id === this.loggedUser.id),
        ),
      );
    });
  }

  async getPrivateUnjoinedRooms() {
    return await this.getAllRoomsAsSiteOwner().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some(
          (p) =>
            r.is_private &&
            !r.participants.some((p) => p.user.id === this.loggedUser.id),
        ),
      );
    });
  }

  async getPublicUnjoinedRooms() {
    return await this.getPublicRooms().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some(
          (p) => !r.participants.some((p) => p.user.id === this.loggedUser.id),
        ),
      );
    });
  }

  async getPublicPasswordProtectedUnjoinedRooms() {
    return await this.getPublicRooms().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter(
        (r) =>
          r.is_password_protected &&
          r.participants.some(
            (p) =>
              !r.participants.some((p) => p.user.id === this.loggedUser.id),
          ),
      );
    });
  }

  async getOwnedRooms() {
    return await this.getUserRooms().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some((p) =>
          r.participants.some(
            (p) => p.is_owner && p.user.id === this.loggedUser.id,
          ),
        ),
      );
    });
  }

  async getParticipatingNotOwnedRooms() {
    return await this.getUserRooms().then((response) => {
      const rooms = response.body as RoomDto[];
      return rooms.filter((r) =>
        r.participants.some((p) =>
          r.participants.some(
            (p) => p.is_owner === false && p.user.id === this.loggedUser.id,
          ),
        ),
      );
    });
  }

  async createSimpleRoom(bodyRequest: CreateRoomDto | {}) {
    return await request(this.app.getHttpServer())
      .post('/room')
      .set('Cookie', this.cookies)
      .send(bodyRequest);
  }

  async deleteRoom(
    tmpCookies: string[],
    room_id: string) {
    return await request(this.app.getHttpServer())
      .delete(`/room/${room_id}/remove`)
      .set('Cookie', tmpCookies);
  }

  async getAllRoomsAsSiteOwner() {
    const SiteOwnerCookies = await this.commons
      .logUser('siteOwner')
      .then((r) => this.commons.getCookies(r));
    expect(SiteOwnerCookies).toHaveLength(2);
    expect(SiteOwnerCookies[0].length).toBeGreaterThan(1);
    expect(SiteOwnerCookies[1].length).toBeGreaterThan(1);

    return await request(this.app.getHttpServer())
      .get('/room/all')
      .set('Cookie', SiteOwnerCookies);
  }

  async updateRoomPassword(
    tmpCookies: string[],
    room_id: string,
    bodyRequest?: { password: string },
  ) {
    const body = bodyRequest ? bodyRequest : {};

    return await request(this.app.getHttpServer())
      .patch(`/room/${room_id}/password`)
      .set('Cookie', tmpCookies)
      .send(body);
  }

  async updateIsPrivateStatus(
    tmpCookies: string[],
    room_id: string,
    bodyRequest?: { is_private: boolean },
  ) {
    const body = bodyRequest ? bodyRequest : {};

    return await request(this.app.getHttpServer())
      .patch(`/room/${room_id}/privateStatus`)
      .set('Cookie', tmpCookies)
      .send(body);
  }

  async joinRoom(
    tmpCookies: string[],
    room_id: string,
    bodyRequest?: { password: string },
  ) {
    const body = bodyRequest ? bodyRequest : {};

    return await request(this.app.getHttpServer())
      .patch(`/me/rooms/${room_id}`)
      .set('Cookie', tmpCookies)
      .send(body);
  }

  async updateModerators(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: UpdateParticipantDto,
  ) {
    return await request(this.app.getHttpServer())
      .patch(`/room/${room_id}/moderator`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async addRestriction(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: CreateRestrictionDto,
  ) {
    return await request(this.app.getHttpServer())
      .post(`/room/${room_id}/restriction`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async addParticipant(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: CreatedParticipant,
  ) {
    return await request(this.app.getHttpServer())
      .post(`/room/${room_id}/participant`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async leaveRoom(tmpCookies: string[], room_id: string) {
    return await request(this.app.getHttpServer())
      .delete(`/me/rooms/${room_id}`)
      .set('Cookie', tmpCookies);
  }

  async getRoomMessages(tmpCookies: string[], room_id: string) {
    return await request(this.app.getHttpServer())
      .get(`/room/${room_id}/message`)
      .set('Cookie', tmpCookies);
  }

  async postMessages(
    tmpCookies: string[],
    room_id: string,
    bodyRequest: createMessageDto,
  ) {
    return await request(this.app.getHttpServer())
      .post(`/room/${room_id}/message`)
      .set('Cookie', tmpCookies)
      .send(bodyRequest);
  }

  async getUserRooms() {
    return await request(this.app.getHttpServer())
      .get('/me/rooms')
      .set('Cookie', this.cookies);
  }

  async getPublicRooms() {
    return await request(this.app.getHttpServer())
      .get('/room/publics')
      .set('Cookie', this.cookies);
  }

  makeOneRandomRoom(
    probPrivate = 0.5,
    probaParticipant = 0.4,
    probaPassword = 0.3,
  ): RandomRoom {
    let participants: CreatedParticipant[] = [];
    this.users.forEach((user) => {
      if (Math.random() < probaParticipant) {
        participants.push({ id: user.id });
      }
    });

    return {
      id: '',
      owner_created: { id: '' },
      participants: participants,
      is_private: Math.random() < probPrivate,
      password: Math.random() < probaPassword ? faker.internet.password() : '',
    };
  }

  async generateManyRandomRoomsForLoggedUser(
    nbRoomTested: number,
    probPrivate?: number,
    probaParticipant?: number,
    probaPassword?: number,
  ) {
    let createdRooms: RandomRoom[] = [];
    for (let i = 0; i < nbRoomTested; i++) {
      const randomRoom = this.makeOneRandomRoom(
        probPrivate,
        probaParticipant,
        probaPassword,
      );
      randomRoom.owner_created.id = this.loggedUser.id;

      await request(this.app.getHttpServer())
        .post('/room')
        .set('Cookie', this.cookies)
        .send(randomRoom)
        .then((resp) => {
          expect(resp.status).toBe(HttpStatus.CREATED);
          expect(resp.body.is_private).toBeDefined();
          expect(resp.body.is_password_protected).toBeDefined();
          expect(resp.body.id).toBeDefined();
          randomRoom.id = resp.body.id;
        });
      createdRooms.push(randomRoom);
    }
    return createdRooms;
  }

  async generateManyRandomRoomsForRandomUsers(
    nbRoomTested: number,
    probPrivate?: number,
    probaParticipant?: number,
    probaPassword?: number,
  ) {
    let createdRooms: RandomRoom[] = [];

    for (let i = 0; i < nbRoomTested; i++) {
      const ran = Math.floor((Math.random() * 100) % this.users.length);
      let roomOwnerId: { id: string };
      const tmpCookie = await this.commons
        .logUser(this.commons.testUserBatch[ran].login)
        .then((response) => {
          roomOwnerId = { id: response.body.id };
          return this.commons.getCookies(response);
        });

      const randomRoom = this.makeOneRandomRoom(
        probPrivate,
        probaParticipant,
        probaPassword,
      );
      randomRoom.owner_created.id = roomOwnerId.id;

      await request(this.app.getHttpServer())
        .post('/room')
        .set('Cookie', tmpCookie)
        .send(randomRoom)
        .then((resp) => {
          expect(resp.status).toBe(HttpStatus.CREATED);
          expect(resp.body.is_private).toBeDefined();
          expect(resp.body.is_password_protected).toBeDefined();
          expect(resp.body.id).toBeDefined();
          randomRoom.id = resp.body.id;
        });
      createdRooms.push(randomRoom);
    }
    return createdRooms;
  }
}
