import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {

	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	create(user: Partial<User>) {
		const newUser = this.repo.create(user);
		return this.repo.save(newUser);
	}

	findOne(id: number) {
		if ( ! id) {
			return null;
		}
		return this.repo.findOne(id);
	}

	find(login_42: string) {
		return this.repo.find({ login_42 });
	}

	async update( id: number, attrs: Partial<User> ) {
		const user = await this.findOne(id);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		Object.assign(user, attrs);
		return this.repo.save(user);
	}

	async remove(id: number) {
		const user = await this.findOne(id);
		if ( ! user) {
			throw new NotFoundException('user not found');
		}
		return this.repo.remove(user);
	}
}
