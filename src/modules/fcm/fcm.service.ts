import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFcmDto } from './dto/create-fcm.dto';
import { UpdateFcmDto } from './dto/update-fcm.dto';
import { FcmEntity } from './entities/fcm.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class FcmService {
  constructor(
    @InjectRepository(FcmEntity)
    private fcmRepository: Repository<FcmEntity>,
    private userService: UserService,
  ) {

  }

  async create(createFcmDto: CreateFcmDto): Promise<FcmEntity> {
    const user = await this.userService.findOne(createFcmDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${createFcmDto.userId} not found`);
    }

    const existingFcm = await this.fcmRepository.findOne(
      {
        where: { user: { userId: createFcmDto.userId }, fcmToken: createFcmDto.oldFcmToken }
      });

    if (existingFcm) {
      // update the existing FCM token
      existingFcm.fcmToken = createFcmDto.fcmToken;
      return await this.fcmRepository.save(existingFcm);
    }

    // const fcm = this.fcmRepository.create(createFcmDto);
    return await this.fcmRepository.save({
      fcmToken: createFcmDto.fcmToken,
      user: user,
    });
  }

  async findAll(): Promise<FcmEntity[]> {
    return await this.fcmRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<FcmEntity | null> {
    return await this.fcmRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async getTokensByUserId(userId: number): Promise<string[]> {
    const fcmEntities = await this.fcmRepository.find({
      where: { user: { userId } },
    });
    return fcmEntities.map(fcm => fcm.fcmToken);
  }

  async update(id: number, updateFcmDto: UpdateFcmDto): Promise<FcmEntity | null> {
    const fcm = await this.findOne(id);
    if (!fcm) {
      throw new NotFoundException(`FCM with id ${id} not found`);
    }
    const user = await this.userService.findOne(updateFcmDto.userId as number);
    if (!user) {
      throw new NotFoundException(`User with id ${updateFcmDto.userId} not found`);
    }
    await this.fcmRepository.update(id, {
      ...updateFcmDto,
      user: user,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const fcm = await this.findOne(id);
    if (!fcm) {
      throw new NotFoundException(`FCM with id ${id} not found`);
    }
    await this.fcmRepository.remove(fcm);
  }
}
