import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Room) private repoRoom: Repository<Room>,
		private usersService: UsersService
	) {}

	async create(user: User, roomData: CreateRoomDto) {

		const room = this.repoRoom.create(roomData as Partial<Room>);
		room.owner = user;
		room.participants.push(user);
		// const arr = roomData.participants;
		// const participants = arr.map( async(value) => {
		// 	return await this.usersService.find({id: value.id}).catch();
		// })

		// console.log(room);
		// console.log(participants);
		const ret = await this.repoRoom.save(room);
		console.log(ret);
	}

}

