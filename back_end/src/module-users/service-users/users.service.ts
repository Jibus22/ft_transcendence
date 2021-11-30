import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User) private repoUser: Repository<User>,
		) {}

	async create(user: Partial<User> | Partial<User>[]) {
		const newUser = this.repoUser.create(user as Partial<User>);
		return await this.repoUser.save(newUser);
	}

	async remove(login: string) {
		const user = await this.find(login);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		return await this.repoUser.remove(user);
	}

	async findOne(id: string) {
		if ( ! id) {
			return null;
		}
		return await this.repoUser.findOne(id);
	}

	async find(login: string) {
		return await this.repoUser.find({ login });
	}

	async findByLogin42(login_42: string) {
		return await this.repo.find({ login_42 });
	}

	async update(id: string, attrs: Partial<User>) {
		const user = await this.findOne(id);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		Object.assign(user, attrs);
		return await this.repoUser.save(user);
	}

	async getAllUsers() {
		return await this.repoUser.find();
	}

}
