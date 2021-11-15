import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../service_users/users.service';

@Injectable()
export class FriendsService {

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private userService: UsersService,
  ) {}

  async getAllFriends() {
	}

  async addFriend() {

	}

	async removeFriend() {
	}
}
