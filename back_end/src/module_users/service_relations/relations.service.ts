import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToClass, classToPlain, plainToClass } from 'class-transformer';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { getConnection, Repository } from 'typeorm';
import { OwnInfoUserDto } from '../dtos/ownInfoUser.dto copy';
import { UserDto } from '../dtos/user.dto';
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

  // @Serialize(OwnInfoUserDto)
  async getAllRelations(userId: string, relation: RelationType) {
    return await getConnection()
      .createQueryBuilder()
      .relation(User, relation)
      .of(userId)
      .loadMany()
      .then((value) => {
        return plainToClass(UserDto, value, { excludeExtraneousValues: true });
      })
      .catch((error) => {
        throw new ConflictException(error.message); // TODO error message to be refined
      });
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
      .catch((error) => {
        throw new ConflictException(error.message); // TODO error message to be refined
      });
  }
}
