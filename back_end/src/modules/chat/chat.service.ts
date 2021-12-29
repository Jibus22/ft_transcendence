import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ChatMessage } from './entities/chatMessage.entity';
import { Participant } from './entities/participant.entity';
import { Room } from './entities/room.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private repoRoom: Repository<Room>,
    @InjectRepository(ChatMessage) private repoMessage: Repository<ChatMessage>,
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

  private async createParticipant(
    participant: CreateParticipantDto,
    room: Room,
    roomOwner: User,
  ) {
    const user = await this.usersService.findOne(participant.id);
    if (user) {
      const newParticipant = this.repoParticipants.create({ user, room });
      const isOwner = roomOwner.id === participant.id;
      newParticipant.is_owner = isOwner;
      newParticipant.is_moderator = isOwner;
      await this.repoParticipants.save(newParticipant).catch((error) => {
        console.log(error);
      });
    }
  }

  private async createRoom(createRoomDto: CreateRoomDto) {
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

  async create(currentUser: User, createRoomDto: CreateRoomDto) {
    // TODO can we encode it in DTO Transform?
    if (createRoomDto.password?.length) {
      createRoomDto.password = await this.encodePassword(
        createRoomDto.password,
      );
    } else {
      createRoomDto.password = null;
    }

    const room = await this.createRoom(createRoomDto);
    await this.createParticipant(currentUser, room, currentUser);

    for (let i = 0; i < createRoomDto.participants.length; i++) {
      const participant = createRoomDto.participants[i];
      if (participant.id !== currentUser.id) {
        await this.createParticipant(participant, room, currentUser);
      }
    }
    return room;
  }

  async findAll() {
    return await this.repoRoom.find({
      relations: ['participants', 'participants.user'],
    });
  }

  async findUserRoomList(user: User) {
    const roomIds: { id: string }[] =
      await this.usersService.findRoomParticipations(user.id);

    const rooms = await this.repoRoom.findByIds(roomIds.map(item => item.id), {
      relations: ['participants', 'participants.user'],
    });
    return rooms;
  }

  async findOne(id: string) {
    return this.repoRoom.findOne(id);
  }

  async findOneWithParticipants(id: string) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .where('room.id = :id', { id })
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .getOne();
  }

  async findOneWithMessages(id: string) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .where('room.id = :id', { id })
      .leftJoinAndSelect('room.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .getOne();
  }

  update(id: number, updateChatDto: UpdateRoomDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(targetedRoom: Room) {
    return await this.repoRoom.remove(targetedRoom);
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        ROOM PARTICIPATION
  -------------------------------------------------------------------
  ===================================================================
  */

  async joinRoom(user: User, room: Room, body: { password: string }) {
    if (
      room.password.length &&
      (await this.checkPassword(room.password, body.password)) === false
    ) {
      throw {
        status: HttpStatus.FORBIDDEN,
        error: 'invalid password',
      };
    }
    const roomOwner = room.participants.find((p) => p.is_owner);
    return await this.createParticipant(user, room, roomOwner.user).catch(
      (error) => {
        throw {
          status: HttpStatus.BAD_REQUEST,
          error: 'could not save to database',
        };
      },
    );
  }

  async leaveRoom(user: User, room: Room) {
    throw new Error('Method not implemented.');
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
