import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UsersService } from '../service_users/users.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private userService: UsersService,
  ) {}

  async getAllFriends(userId: string) {
    return await getConnection()
      .createQueryBuilder()
      .relation(User, "friends")
      .of(userId)
      .loadMany();
  }

  async addFriend(userId: string, friendId: string) {
    if (friendId === userId) {
      throw new BadRequestException('Cannot add oneself as a friend');
    }
    await getConnection()
    .createQueryBuilder()
    .relation(User, 'friends')
    .of(userId)
    .add(friendId)
    .catch((error) => {
      throw new ConflictException(error.message); // TODO error message to be refined
    });
  }

  async removeFriend(userId: string, friendId: string) {
    await getConnection()
      .createQueryBuilder()
      .relation(User, 'friends')
      .of(userId)
      .remove(friendId)
      .catch((error) => {
        throw new ConflictException(error.message); // TODO error message to be refined
      });
  }
}
