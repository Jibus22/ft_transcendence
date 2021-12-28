import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { createQueryBuilder, Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Participant } from './entities/participant.entity';
import { Room } from './entities/room.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private repoRoom: Repository<Room>,
    @InjectRepository(Participant)
    private repoParticipants: Repository<Participant>,
    private usersService: UsersService,
  ) {}

  private async encodePassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  // private async validatePassword(encodedPassword: string, userEntry: string) {
  //   const [salt, storedHash] = encodedPassword.split('.');

  //   const hash = (await scrypt(userEntry, salt, 32)) as Buffer;
  //   return storedHash === hash.toString('hex');
  // }

  private async createParticipant(
    participant: CreateParticipantDto,
    room: Room,
    isOwner: boolean,
  ) {
    const user = await this.usersService.findOne(participant.id);
    if (user) {
      const newParticipant = this.repoParticipants.create({ user, room });
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
    await this.createParticipant(currentUser, room, true);

    for (let i = 0; i < createRoomDto.participants.length; i++) {
      const participant = createRoomDto.participants[i];
      if (participant.id !== currentUser.id) {
        await this.createParticipant(participant, room, false);
      }
    }
    return room;
  }

  async findAll() {
    return await this.repoRoom
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .getMany();
  }

  async findUserRoomList(user: User) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .orWhere('room.is_private = false')
      .orWhere('user.id = :id', { id: user.id })
      .getMany();
  }

  async findOne(id: string) {
    return this.repoRoom.findOne(id);
  }

  async findOneWithRelations(id: string) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .where('room.id = :id', { id })
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .getOne();
  }

  update(id: number, updateChatDto: UpdateRoomDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(targetedRoom: Room) {
    return await this.repoRoom.remove(targetedRoom);
  }
}
