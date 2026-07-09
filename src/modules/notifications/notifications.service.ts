import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Not, Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    private userService: UserService,
  ) {

  }

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationEntity> {
    const userFrom = await this.userService.findOne(createNotificationDto.userFromId);
    if (!userFrom) {
      throw new NotFoundException(`User with id ${createNotificationDto.userFromId} not found`);
    }
    const userTo = await this.userService.findOne(createNotificationDto.userToId);
    if (!userTo) {
      throw new NotFoundException(`User with id ${createNotificationDto.userToId} not found`);
    }

    // const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save({
      ...createNotificationDto,
      userFrom: userFrom,
      userTo: userTo,
    });
  }

  async findAll(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find();
  }

  async filterPagination(page: number, limit: number, userFromId: number, userToId: number, isSeen: boolean, type: string, title: string, body: string, additionalData: object): Promise<any> {
    const query = this.notificationRepository.createQueryBuilder('notification');

    if (userFromId) {
      query.andWhere('notification.userFromId = :userFromId', { userFromId });
    }
    if (userToId) {
      query.andWhere('notification.userToId = :userToId', { userToId });
    }
    if (isSeen !== undefined) {
      query.andWhere('notification.isSeen = :isSeen', { isSeen });
    }
    if (type) {
      query.andWhere('notification.type = :type', { type });
    }
    if (title) {
      query.andWhere('notification.title = :title', { title });
    }
    if (body) {
      query.andWhere('notification.body = :body', { body });
    }
    if (additionalData) {
      query.andWhere('notification.additionalData = :additionalData', { additionalData });
    }

    query.orderBy('notification.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [dataNotifications, total] = await query.getManyAndCount();
    return [dataNotifications, total];
  }
  async findOne(id: number): Promise<NotificationEntity | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<NotificationEntity | null> {
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    const userFrom = await this.userService.findOne(updateNotificationDto.userFromId as number);
    if (!userFrom) {
      throw new NotFoundException(`User with id ${updateNotificationDto.userFromId} not found`);
    }
    const userTo = await this.userService.findOne(updateNotificationDto.userToId as number);
    if (!userTo) {
      throw new NotFoundException(`User with id ${updateNotificationDto.userToId} not found`);
    }

    await this.notificationRepository.update(id, {
      ...updateNotificationDto,
      userFrom: userFrom,
      userTo: userTo,
    });
    return this.notificationRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    await this.notificationRepository.delete(id);
  }
}
