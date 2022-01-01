import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { FindManyOptions, Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateRestrictionDto } from './dto/create-restriction.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
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
        ROOMS METHODS
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
      await this.repoParticipants.save(newParticipant).catch((error) => {
        console.log(error);
      });
    }
  }

  private async addRoom(createRoomDto: CreateRoomDto) {
    const newRoom = this.repoRoom.create({
      is_private: createRoomDto.is_private,
      password: createRoomDto.password,
    });

    return await this.repoRoom.save(newRoom).catch((error) => {
      console.log(error);
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'could not save to database',
      };
    });
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

    const room = await this.addRoom(createRoomDto);
    const participants = this.cleanParticipants(
      createRoomDto.participants,
      currentUser,
    );
    for (const p of participants) {
      await this.createParticipant(p, room, currentUser);
    }
    return room;
  }

  async findAll() {
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
      where: 'room.is_private = false',
    });
  }

  async findUserRoomList(user: User) {
    const roomIds: { id: string }[] =
      await this.usersService.findRoomParticipations(user.id);

    const rooms = await this.repoRoom.findByIds(
      roomIds.map((item) => item.id),
      {
        relations: ['participants', 'participants.user'],
      },
    );
    return rooms;
  }

  async findOne(id: string) {
    return this.repoRoom.findOne(id);
  }

  async findOneWithParticipants(id: string) {
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
      .innerJoin('message.room', 'room')
      .innerJoinAndSelect('message.sender', 'sender')
      .where('room.id = :id', { id })
      .getMany();
  }

  async updatePassword(room: Room, updatePasswordDto: UpdatePasswordDto) {
    if (updatePasswordDto.password.length === 0) {
      room.password = null;
    } else {
      room.password = await this.encodePassword(updatePasswordDto.password);
    }
    return this.repoRoom.save(room);
  }

  async removeRoom(targetedRoom: Room) {
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
    const {user: roomOwner} = room.participants.find(p => p.is_owner);
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
    return await this.createParticipant(user.id, room, roomOwner.user).catch(
      (error) => {
        throw {
          status: HttpStatus.BAD_REQUEST,
          error: 'could not save to database',
        };
      },
    );
  }

  async leaveRoom(user: User, room: Room) {
    const participant = room.participants.find((p) => p.user.id === user.id);
    if (participant.is_owner) {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: `owner cannot leave room ${room?.id}, must delete it`,
      };
    }
    await this.repoParticipants.remove(participant);
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
        RESTRINCTIONS METHODS
  -------------------------------------------------------------------
  ===================================================================
  */

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
      expiration_time: Date.now() + restrictionDto.duration * 1000 * 60,
    });
    await this.repoRestriction
      .save(restriction)
      .catch((err) => console.log(err));

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
        r.expiration_time - Date.now() > 0
      );
    });
  }

  extractExpiredRestrictions(restrictions: Restriction[]) {
    return restrictions.filter((r) => {
      return Date.now() - r.expiration_time > 0;
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
    messageDto: Partial<ChatMessage>,
  ) {
    messageDto.room = room;
    messageDto.sender = user;
    messageDto.timestamp = Date.now();
    const message = this.repoMessage.create(messageDto);
    return await this.repoMessage.save(message);
  }
}
