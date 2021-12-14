import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';

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
		return await this.repo.remove(user);
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

	async update(id: string, attrs: Partial<User>) {
		const user = await this.findOne(id);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		Object.assign(user, attrs);
		return await this.repo.save(user);
	}

	async getAllUsers() {
		return await this.repo.find();
	}

}
