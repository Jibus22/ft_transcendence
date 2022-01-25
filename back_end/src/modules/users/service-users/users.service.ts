import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUtilsService } from '../../../utils/app-utils.service';
import { Room } from '../../chat/entities/room.entity';
import { User } from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly appUtils: AppUtilsService,
    @InjectRepository(User) private repoUser: Repository<User>,
  ) {}

  async whoAmI(user: User) {
    await this.appUtils.fetchPossiblyMissingData(this.repoUser, user, [
      'players',
    ]);
  }

  async create(user: Partial<User> | Partial<User>[]) {
    const newUser = this.repoUser.create(user as Partial<User>);
    return await this.repoUser.save(newUser);
  }

  async remove(login: string) {
    const user = await this.find({ login });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.repoUser.remove(user);
  }

  async findOne(id: string) {
    if (!id) {
      return null;
    }
    return await this.repoUser.findOne(id);
  }

  async findLogin(login: string) {
    if (!login) {
      return null;
    }
    return await this.repoUser.findOne({ login: login });
  }

  async findOneWithRelations(id: string) {
    if (!id) {
      return null;
    }
    return await this.repoUser.findOne(id, {
      relations: ['local_photo', 'players'],
    });
  }

  async findRoomParticipations(id: string): Promise<Room[]> {
    if (!id) {
      return null;
    }
    return await this.repoUser
      .createQueryBuilder('user')
      .where('user.id = :id', { id: id })
      .innerJoin('user.room_participations', 'participations')
      .innerJoin('participations.room', 'room')
      .select('room.id', 'id')
      .getRawMany();
  }

  async find(user: Partial<User>) {
    return await this.repoUser.find({
      where: user,
      relations: ['local_photo'],
    });
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    return await this.repoUser.save(user);
  }

  async getAllUsers() {
    return await this.repoUser.find({
      relations: ['local_photo'],
    });
  }

  async getAllPlayersUsers() {
    return await this.repoUser.find({
      relations: ['local_photo', 'players'],
    });
  }
}
