import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashtagEntity } from './entities/hashtag.entity';
import { PromotionEntity } from '../promotions/entities/promotion.entity';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(HashtagEntity)
    private hashtagsRepository: Repository<HashtagEntity>,
  ) {

  }


  normalizeString(input: string): string {
    if (!input) return '';

    return input
      .normalize('NFD')                     // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '')      // xóa dấu thanh
      .replace(/đ/g, 'd')                   // thay 'đ' → 'd'
      .replace(/Đ/g, 'd')                   // thay 'Đ' → 'd'
      .replace(/\s+/g, '')                  // xóa khoảng trắng
      .toLowerCase();                       // chuyển về chữ thường
  }

  async create(createHashtagDto: CreateHashtagDto): Promise<HashtagEntity> {
    // const newHashtag = this.hashtagsRepository.create(createHashtagDto);
    const name = this.normalizeString(createHashtagDto.name);
    return await this.hashtagsRepository.save({
      // name: createHashtagDto.name,/
      name: name,
      description: createHashtagDto.description,
    });
  }

  async createListHashtags(createListHashtagsDto: CreateHashtagDto[]): Promise<HashtagEntity[]> {
    const createdHashtags: HashtagEntity[] = [];
    for (const createHashtagDto of createListHashtagsDto) {
      const name = this.normalizeString(createHashtagDto.name);
      const existingHashtag = await this.hashtagsRepository.findOne({ where: { name: name } });
      if (existingHashtag) {
        createdHashtags.push(existingHashtag);
        continue; // Bỏ qua nếu đã tồn tại hashtag với tên đã chuẩn hóa
      }
      const hashtag = this.hashtagsRepository.create({
        name: name,
        description: createHashtagDto.description,
      });
      const savedHashtag = await this.hashtagsRepository.save(hashtag);
      createdHashtags.push(savedHashtag);
    }
    return createdHashtags;
  }
  async findAll(): Promise<HashtagEntity[]> {
    return await this.hashtagsRepository.find();
  }
  async findAllPagination(page: number, limit: number): Promise<[HashtagEntity[], number]> {
    const query = this.hashtagsRepository.createQueryBuilder('hashtag');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, name: string): Promise<[HashtagEntity[], number]> {
    const query = this.hashtagsRepository.createQueryBuilder('hashtag');
    if (name) {
      query.andWhere('hashtag.name LIKE :name', { name: `%${name}%` });
    }
    query.orderBy('hashtag.hashtagId', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [dataHashtags, total] = await query.getManyAndCount();
    return [dataHashtags, total];
  }


  async findOne(id: number): Promise<HashtagEntity | null> {
    const hashtag = await this.hashtagsRepository.findOne({
      where: { hashtagId: id },
    });
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }
    return hashtag;
  }

  async findOneByID(id: number | undefined): Promise<HashtagEntity | null> {
    const hashtag = await this.hashtagsRepository.findOne({
      where: { hashtagId: id },

    });
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }
    return hashtag;
  }

  // async findOne(id: number) {
  //   return await this.hashtagsRepository.findOne(id);
  // }

  async update(id: number, updateHashtagDto: UpdateHashtagDto): Promise<HashtagEntity | null> {

    const hashtag = await this.hashtagsRepository.findOne({
      where: { hashtagId: id },
    });
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }
    await this.hashtagsRepository.update(id, {
      name: updateHashtagDto.name,
      description: updateHashtagDto.description,
      // Update other fields as necessary
    });
    return await this.hashtagsRepository.findOne({ where: { hashtagId: id } });
  }


  async remove(id: number): Promise<void> {
    const hashtag = await this.hashtagsRepository.findOne({
      where: { hashtagId: id },
    });
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }
    await this.hashtagsRepository.delete(id);
  }
}
