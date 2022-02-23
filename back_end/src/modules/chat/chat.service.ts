import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { FindManyOptions, Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateRestrictionDto } from './dto/create-restriction.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateIsPrivateDto } from './dto/update-isPrivate.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Restriction } from './entities/restriction.entity';
import { Room } from './entities/room.entity';
const scrypt = promisify(_scrypt);

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private repoRoom: Repository<Room>,
    @InjectRepository(ChatMessage) private repoMessage: Repository<ChatMessage>,
    @InjectRepository(Restriction)
    private repoRestriction: Repository<Restriction>,
    @InjectRepository(Participant)
    private repoParticipants: Repository<Participant>,
    private usersService: UsersService,
  ) {}

  /*
  ===================================================================
  -------------------------------------------------------------------
        CREATE A ROOM
  -------------------------------------------------------------------
  ===================================================================
  */

  private async encodePassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  private async checkPassword(encodedPassword: string, userEntry: string) {
    const [salt, storedHash] = encodedPassword.split('.');

    const hash = (await scrypt(userEntry, salt, 32)) as Buffer;
    return storedHash === hash.toString('hex');
  }

  async createParticipant(userId: string, room: Room, roomOwner: User) {
    const user = await this.usersService.findOne(userId);
    if (user) {
      const newParticipant = this.repoParticipants.create({ user, room });
      const isOwner = roomOwner.id === userId;
      newParticipant.is_owner = isOwner;
      newParticipant.is_moderator = isOwner;
      return await this.repoParticipants.save(newParticipant);
    } else {
      new Logger('CreateParticipant').debug(
        'failed to add missing user',
        userId,
      );
    }
  }

  private async addRoom(createRoomDto: CreateRoomDto) {
    const newRoom = this.repoRoom.create({
      is_private: createRoomDto.is_private,
      password: createRoomDto.password,
    });

    return await this.repoRoom.save(newRoom);
  }

  private cleanParticipants(
    participantsDto: CreateParticipantDto[],
    roomOwner: User,
  ) {
    let participants = new Set(participantsDto.map((p) => p.id));
    participants.add(roomOwner.id);
    return participants;
  }

  async createRoom(currentUser: User, createRoomDto: CreateRoomDto) {
    if (createRoomDto.password?.length) {
      createRoomDto.password = await this.encodePassword(
        createRoomDto.password,
      );
    } else {
      createRoomDto.password = null;
    }

    let room = await this.addRoom(createRoomDto);
    room.participants = [];
    const participants = this.cleanParticipants(
      createRoomDto.participants,
      currentUser,
    );
    for (const p of participants) {
      const newParticipant = await this.createParticipant(p, room, currentUser);
      if (newParticipant) {
        room.participants.push(newParticipant);
      }
    }
    return room;
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        FINDS FUNCTIONS
  -------------------------------------------------------------------
  ===================================================================
  */

  async findAllWithRestrictions() {
    return await this.repoRoom.find({
      relations: [
        'participants',
        'participants.user',
        'restrictions',
        'restrictions.user',
      ],
    });
  }

  async findAllPublic() {
    return await this.repoRoom.find({
      relations: ['participants', 'participants.user'],
      where: 'is_private = false',
    });
  }

  async findUserRoomListWithMessages(user: User) {
    const roomIds: { id: string }[] =
      await this.usersService.findRoomParticipations(user.id);

    const rooms = await this.repoRoom.findByIds(
      roomIds.map((item) => item.id),
      {
        relations: [
          'participants',
          'participants.user',
          'messages',
          'messages.sender',
        ],
      },
    );
    return rooms;
  }

  async findOneWithParticipants(id: string) {
    return await this.repoRoom.findOne(id, {
      relations: ['participants', 'participants.user'],
    });
  }

  async findOneWithParticipantsAndRestrictions(id: string) {
    return await this.repoRoom.findOne(id, {
      relations: [
        'participants',
        'participants.user',
        'restrictions',
        'restrictions.user',
      ],
    });
  }

  async findOneWithMessages(id: string) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .where('room.id = :id', { id })
      .leftJoinAndSelect('room.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .getOne();
  }

  async findAllMessages(id: string) {
    return await this.repoMessage
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.room', 'room')
      .innerJoinAndSelect('message.sender', 'sender')
      .where('room.id = :id', { id })
      .orderBy('message.timestamp', 'DESC')
      .getMany();
  }

  async updatePassword(room: Room, updatePasswordDto: UpdatePasswordDto) {
    if (updatePasswordDto.password.length === 0) {
      room.password = null;
    } else {
      room.password = await this.encodePassword(updatePasswordDto.password);
    }
    return await this.repoRoom.save(room);
  }

  async updatePrivateStatus(
    room: Room,
    updateIsPrivateDto: UpdateIsPrivateDto,
  ) {
    if (updateIsPrivateDto.is_private !== room.is_private) {
      room.is_private = updateIsPrivateDto.is_private;
      return await this.repoRoom.save(room);
    }
  }

  async removeRoom(targetedRoom: Room) {
    await this.repoParticipants.remove(targetedRoom.participants);
    return await this.repoRoom.remove(targetedRoom);
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        ROOM PARTICIPATION
  -------------------------------------------------------------------
  ===================================================================
  */

  async addParticipant(room: Room, createPaticipant: CreateParticipantDto) {
    if (room.participants.some((p) => p.user.id === createPaticipant.id)) {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'user already participant in this room',
      };
    }
    const { user: roomOwner } = room.participants.find((p) => p.is_owner);
    return await this.createParticipant(createPaticipant.id, room, roomOwner);
  }

  async joinRoom(user: User, room: Room, body: { password?: string }) {
    if (
      room.password?.length &&
      (await this.checkPassword(room.password, body?.password)) === false
    ) {
      throw {
        status: HttpStatus.FORBIDDEN,
        error: 'invalid password',
      };
    }
    const roomOwner = room.participants.find((p) => p.is_owner);
    return await this.createParticipant(user.id, room, roomOwner.user);
  }

  async leaveRoom(user: User, room: Room) {
    const participant = await this.repoParticipants.find({
      where: { user: user, room: room },
      relations: ['user', 'room'],
    });
    if (participant[0]) {
      await this.repoParticipants.remove(participant[0]);
    }
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        MODERATION
  -------------------------------------------------------------------
  ===================================================================
  */

  async updateParticipant(updateDto: UpdateParticipantDto) {
    const participant = await this.repoParticipants.findOne(
      updateDto.participant_id,
    );
    if (!participant) {
      throw {
        status: HttpStatus.NOT_FOUND,
        error: `participant missing`,
      };
    }
    participant.is_moderator = updateDto.is_moderator;
    return await this.repoParticipants.save(participant);
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        RESTRICTIONS METHODS
  -------------------------------------------------------------------
  ===================================================================
  */

  getNow() {
    return Date.now();
  }

  async createRestriction(room: Room, restrictionDto: CreateRestrictionDto) {
    const targetedParticipant = room.participants.find(
      (p) => p.user.id === restrictionDto.user_id,
    );
    if (!targetedParticipant) {
      throw {
        status: HttpStatus.NOT_FOUND,
        error: `participant missing`,
      };
    } else if (targetedParticipant.is_owner) {
      throw {
        status: HttpStatus.FORBIDDEN,
        error: `owner of the room cannot be banned`,
      };
    }

    const restriction = this.repoRestriction.create({
      user: targetedParticipant.user,
      room: room,
      restriction_type: restrictionDto.restriction_type,
      expiration_time: this.getNow() + restrictionDto.duration * 1000 * 60,
    });
    await this.repoRestriction.save(restriction);

    if (restrictionDto.restriction_type === 'ban') {
      await this.repoParticipants.remove(targetedParticipant);
    }
  }

  async removeRestrictions(restrictions: Restriction[]) {
    return await this.repoRestriction.remove(restrictions);
  }

  async getRestrictions(type?: string) {
    const options: FindManyOptions = type
      ? { where: { restriction_type: type } }
      : {};
    return await this.repoRestriction.find(options);
  }

  extractValidRestrictions(room: Room, type?: string) {
    return room.restrictions.filter((r) => {
      return (
        (!type || r.restriction_type === type) &&
        r.expiration_time - this.getNow() > 0
      );
    });
  }

  extractExpiredRestrictions(restrictions: Restriction[]) {
    return restrictions.filter((r) => {
      return this.getNow() - r.expiration_time > 0;
    });
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        MESSAGES METHODS
  -------------------------------------------------------------------
  ===================================================================
  */

  async createMessage(
    room: Room,
    user: User,
    newMessage: Partial<ChatMessage>,
  ) {
    newMessage.room = room;
    newMessage.sender = user;
    newMessage.timestamp = this.getNow();
    const message = this.repoMessage.create(newMessage);
    return await this.repoMessage.save(message);
  }
}
