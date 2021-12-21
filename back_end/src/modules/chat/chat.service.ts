import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assert } from 'console';
import { randomBytes, scrypt as _scrypt } from "crypto";
import { Repository } from 'typeorm';
import { promisify } from "util";
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

const scrypt = promisify(_scrypt);


@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private repoRoom: Repository<Room>,
    private usersService: UsersService,
  ) {}

  async encodePassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  async validatePassword(encodedPassword: string, userEntry: string) {
    const [salt, storedHash] = encodedPassword.split('.');

		const hash = (await scrypt(userEntry, salt, 32) as Buffer);
		return storedHash === hash.toString('hex');
  }

  async create(user: User, createChatDto: CreateRoomDto) {
    const room = this.repoRoom.create(createChatDto as Partial<Room>);
    if (room.password) {
      room.password = await this.encodePassword(room.password);
    }
    room.owner = user;
    return await this.repoRoom.save(room).catch((error) => {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'could not save to database',
      };
    });
  }

  async findAll() {
    return await this.repoRoom.find({
      relations: ['owner', 'participants'],
    });
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
