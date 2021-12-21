import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Room) private repoRoom: Repository<Room>,
		private usersService: UsersService
	) {}

  async create(user: User, createChatDto: CreateRoomDto) {
		const room = this.repoRoom.create(createChatDto as Partial<Room>);
		room.owner = user;
		room.participants.push(user);
		return await this.repoRoom.save(room, {

		});
  }

  async findAll() {
		return await this.repoRoom.find({
      relations: [ 'owner', 'participants']
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
