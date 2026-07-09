import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { Repository } from 'typeorm';
// import { ProductEntity } from '../products/entities/product.entity';

@Injectable()
export class PromotionsService {

  constructor(
    @InjectRepository(PromotionEntity)
    private promotionsRepository: Repository<PromotionEntity>,

  ) {

  }
  async create(createPromotionDto: CreatePromotionDto): Promise<PromotionEntity> {
    // const promotion = this.promotionsRepository.create(createPromotionDto);
    return await this.promotionsRepository.save({
      description: createPromotionDto.description,
      discount: createPromotionDto.discount,
      startDate: createPromotionDto.startDate,
      endDate: createPromotionDto.endDate,
      status: createPromotionDto.status ?? 'y',
    });
  }

  async findAll(): Promise<PromotionEntity[]> {
    return await this.promotionsRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[PromotionEntity[], number]> {
    const query = this.promotionsRepository.createQueryBuilder('promotion');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async findOne(id: number): Promise<PromotionEntity | null> {
    const promotion = await this.promotionsRepository.findOne({
      where: { promotionId: id },

    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }
    return promotion;
  }

  async findOneByID(id: number | undefined): Promise<PromotionEntity | null> {
    const promotion = await this.promotionsRepository.findOne({
      where: { promotionId: id },

    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }
    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<PromotionEntity | null> {
    const promotion = await this.promotionsRepository.findOne({
      where: { promotionId: id },
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }
    await this.promotionsRepository.update(id, {
      description: updatePromotionDto.description,
      discount: updatePromotionDto.discount,
      startDate: updatePromotionDto.startDate,
      endDate: updatePromotionDto.endDate,
      status: updatePromotionDto.status ?? 'y',
    });
    return await this.promotionsRepository.findOne({ where: { promotionId: id } });
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.promotionsRepository.findOne({
      where: { promotionId: id },
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }
    await this.promotionsRepository.delete(id);
  }
}
