import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/users.entity';

export enum RelationType {
  Friend = 'friends_list',
  Block = 'blocked_list',
}

@Injectable()
export class RelationsService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async readFriendsRelation(userId: string) {
    return await getRepository(User)
      .createQueryBuilder('user')
      .innerJoin('user.friends_list', 'flst')
      .innerJoin('flst.local_photo', 'l_ph')
      .select(['user', 'flst', 'l_ph.fileName'])
      .where('user.id = :id', { id: userId })
      .getOne()
      .then((usr: User) => {
        return usr.friends_list;
      })
      .catch((error) => {
        throw new ConflictException(error.message);
      });
  }

  async readAllRelations(userId: string, relation: RelationType) {
    return await this.repo
      .createQueryBuilder()
      .relation(User, relation)
      .of(userId)
      .loadMany()
      .then((value: UserDto[]) => {
        return value;
      })
      .catch((error) => {
        throw new ConflictException(error.message);
      });
  }

  async createRelation(
    userId: string,
    targetId: string,
    relation: RelationType,
  ) {
    if (targetId === userId) {
      throw new BadRequestException(`Cannot add oneself as a ${relation}`);
    }
    await this.repo
      .createQueryBuilder()
      .relation(User, relation)
      .of(userId)
      .add(targetId)
      .catch((error) => {
        throw new ConflictException(error.message);
      });
  }

  async deleteRelation(
    userId: string,
    targetId: string,
    relation: RelationType,
  ) {
    await this.repo
      .createQueryBuilder()
      .relation(User, relation)
      .of(userId)
      .remove(targetId)
      .catch((error) => {
        throw new ConflictException(error.message);
      });
  }
}
