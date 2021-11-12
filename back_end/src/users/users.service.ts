import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {

	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	async create(user: Partial<User> | Partial<User>[]) {
		const newUser = this.repo.create(user as Partial<User>);
		return await this.repo.save(newUser);
	}

	async remove(login: string) {
		const user = await this.find(login);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		return this.repo.remove(user);
	}

	async findOne(id: string) {
		if ( ! id) {
			return null;
		}
		return await this.repo.findOne(id);
	}

	async find(login: string) {
		return await this.repo.find({ login });
	}

	async update( login: string, attrs: Partial<User> ) {
		const user = await this.findOne(login);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		Object.assign(user, attrs);
		return this.repo.save(user);
	}

}
