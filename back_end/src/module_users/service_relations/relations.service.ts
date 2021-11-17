import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { User } from '../entities/users.entity';

export enum RelationType {
  Friend = 'friends',
  Block = 'blockedAccounts'
}

@Injectable()
export class RelationsService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async getAllRelations(userId: string, relation: RelationType) {
    return await getConnection()
      .createQueryBuilder()
      .relation(User, "friends")
      .of(userId)
      .loadMany();
  }

  async addRelation(userId: string, targetId: string, relation: RelationType ) {
    if (targetId === userId) {
      throw new BadRequestException(`Cannot add oneself as a ${relation}`);
    }
    await getConnection()
    .createQueryBuilder()
    .relation(User, relation)
    .of(userId)
    .add(targetId)
    .catch((error) => {
      throw new ConflictException(error.message); // TODO error message to be refined
    });
  }

  async removeRelation(userId: string, targetId: string, relation: RelationType ) {
    await getConnection()
      .createQueryBuilder()
      .relation(User, relation)
      .of(userId)
      .remove(targetId)
    .then(() => { return this;})
      .catch((error) => {
        throw new ConflictException(error.message); // TODO error message to be refined
      });
  }

  async setRelations(user: User) {
    const friends = await this.repo
      .createQueryBuilder(RelationType.Friend)
      .leftJoinAndSelect(`Users.${RelationType.Friend}`, "friends")
      .getMany();

    console.log(friends);
  }
}
