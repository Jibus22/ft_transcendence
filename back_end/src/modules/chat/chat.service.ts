import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Room) private repoRoom: Repository<Room>) {}

  private async encodePassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  async validatePassword(encodedPassword: string, userEntry: string) {
    const [salt, storedHash] = encodedPassword.split('.');

    const hash = (await scrypt(userEntry, salt, 32)) as Buffer;
    return storedHash === hash.toString('hex');
  }

  filterOutOwner(participants: User[], owner: User) {
    return participants.filter(
      (participant) =>
        (participant.id && participant.id !== owner.id) ||
        (participant.login && participant.login !== owner.login),
    );
  }

  async create(user: User, createRoomDto: CreateRoomDto) {
    const room = this.repoRoom.create(createRoomDto as Partial<Room>);
    if (room.password) {
      room.password = await this.encodePassword(room.password);
    }
    room.owner = user;
    room.participants = this.filterOutOwner(room.participants, room.owner);

    return await this.repoRoom.save(room).catch((error) => {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'could not save to database',
      };
    });
  }

  async findAll() {
    const ret = await this.repoRoom.find({
      relations: ['owner', 'participants'],
    });
    this.logRooms(ret); // TODO remove debug !
    return ret;
  }

  private logRooms(rooms: Room[]) {
    return; // TODO REMOVE FUNCITON DEBUG
    console.log('SIZE OF RETURN: ', rooms.length);
    rooms.forEach((room) => {
      console.log(
        '\n ✅ ROOMS RETURNED ->>>>>>>>>>>>>> ',
        room.id,
        ' | OWNER',
        JSON.stringify(room.owner?.login, null, 4),
        ' | PRIVATE?',
        room.is_private,
        ' | PARTICIPANTS',
        room.participants.length,
        ' | PARTICIPANTS',
        JSON.stringify(
          room.participants.map((user) => user.login),
          null,
          4,
        ),
      );
    });
  }

  async findUserRoomList(user: User) {
    return await this.repoRoom
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.owner', 'user')
      .leftJoinAndSelect('room.participants', 'participant')
      .orWhere('room.is_private = false')
      .orWhere('room.owner = :id', { id: user.id })
      .orWhere('participant.id = :id', { id: user.id })
      .getMany();
  }

  async findOne(id: string) {
    return this.repoRoom.findOne(id);
  }

  async findOneWithRelations(id: string) {
    return this.repoRoom.findOne(id, { relations: ['participants', 'moderators', 'owner']});
  }

  update(id: number, updateChatDto: UpdateRoomDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(id: string) {
    const room = await this.repoRoom.findOneOrFail({ id }).catch((error) => {
      throw {
        status: HttpStatus.NOT_FOUND,
        error: 'could not find room',
      };
    });
    await this.repoRoom.remove(room);
  }
}
