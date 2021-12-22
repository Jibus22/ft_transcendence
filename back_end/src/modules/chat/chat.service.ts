import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assert } from 'console';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
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

  async create(user: User, createRoomDto: CreateRoomDto) {
    const room = this.repoRoom.create(createRoomDto as Partial<Room>);
    if (room.password) {
      room.password = await this.encodePassword(room.password);
    }
    room.owner = user;
    room.participants = room.participants.filter((participant) => {
      return (participant.id !== undefined && participant.id !== room.owner.id)
      || (participant.login !== undefined && participant.login !== room.owner.login)
    });

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
    return;
    console.log('SIZE OF RETURN: ', rooms.length);
    rooms.forEach((room) => {
      console.log("\n ✅ ROOMS RETURNED");
      console.log('OWNER', JSON.stringify(room.owner?.login, null, 4));
      console.log('PRIVATE?', room.is_private);
      const participants = room.participants.map(participant => { return participant.login });
      console.log('PARTICIPANTS', JSON.stringify(participants, null, 4));
    })
  }

  async findAllBelongingRooms(user: User) {
    const ret = await this.repoRoom
    .createQueryBuilder('room')
    .where('room.is_private = false')
    .leftJoin('room.owner', 'user')
    .orWhere('room.owner = :id', { id: user.id })
    .leftJoin('room.participants', 'participant')
    .orWhere('participant.id = :id', { id: user.id })
    .getMany();

    this.logRooms(ret); // TODO remove debug !
    return ret;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateRoomDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
