import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTourPromotionDto } from './dto/create-tour_promotion.dto';
import { UpdateTourPromotionDto } from './dto/update-tour_promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TourPromotionEntity } from './entities/tour_promotion.entity';
import { Not, Repository } from 'typeorm';
import { StartEndDatesService } from '../start_end_dates/start_end_dates.service';
import { PromotionsService } from '../promotions/promotions.service';


@Injectable()
export class TourPromotionsService {

  constructor(
    @InjectRepository(TourPromotionEntity)
    private tourPromotionRepository: Repository<TourPromotionEntity>,
    private startEndDatesService: StartEndDatesService,
    private promotionService: PromotionsService,
  ) {

  }

  async create(createTourPromotionDto: CreateTourPromotionDto): Promise<TourPromotionEntity> {

    console.log(createTourPromotionDto);
    const startEndDate = await this.startEndDatesService.findOneByID(createTourPromotionDto.dateId);
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${createTourPromotionDto.dateId} not found`);
    }
    const promotion = await this.promotionService.findOne(createTourPromotionDto.promotionId);
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${createTourPromotionDto.promotionId} not found`);
    }
    // const tourPromotion = this.tourPromotionRepository.create(createTourPromotionDto);
    return this.tourPromotionRepository.save({
      ...createTourPromotionDto,
      date: startEndDate,
      promotion: promotion,
    });
  }

  async findAll(): Promise<TourPromotionEntity[]> {
    return this.tourPromotionRepository.find();
  }

  async FilterPagination(page: number, limit: number, discount: number, tourId: number): Promise<any> {
    try {
      const query = this.tourPromotionRepository.createQueryBuilder('tourPromotion')
        .leftJoinAndSelect('tourPromotion.date', 'date')
        .leftJoinAndSelect('tourPromotion.promotion', 'promotion')
        .leftJoinAndSelect('date.tour', 'tour')
        .where('tour.status = :status', { status: 'active' })
        .where('promotion.status = :status', { status: 'y' })
      if (discount) {
        query.andWhere('promotion.discount <= :discount', { discount });
      }
      if (tourId) {
        query.andWhere('date.tourId = :tourId', { tourId });
      }
      // .andWhere('hashtag.name ILIKE :hashtag', { hashtag: `%${hashtag}%` })
      // .andWhere('tour.id = :tourId', { tourId })
      query.orderBy('tour.createDate', 'DESC')
      query.skip((page - 1) * limit)
      query.take(limit);

      const [data, total] = await query.getManyAndCount();
      // const [dataHashTagTours, total] = await query.getManyAndCount();
      return [data, total];
    } catch (error) {
      throw error;
    }
  }


  async findOne(id: number): Promise<TourPromotionEntity | null> {
    return this.tourPromotionRepository.findOne({ where: { tourPromotionId: id } });
  }

  async findOneTourPromotion(id: number): Promise<TourPromotionEntity | null> {
    const tourPromotion = await this.tourPromotionRepository.findOne({ where: { tourPromotionId: id } });
    if (!tourPromotion) {
      throw new NotFoundException(`TourPromotion with id ${id} not found`);
    }
    return tourPromotion;
  }

  async update(id: number, updateTourPromotionDto: UpdateTourPromotionDto): Promise<TourPromotionEntity | null> {
    const tourPromotion = await this.findOne(id);
    if (!tourPromotion) {
      throw new NotFoundException(`TourPromotion with id ${id} not found`);
    }
    const startEndDate = await this.startEndDatesService.findOneByID(updateTourPromotionDto.dateId);
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${updateTourPromotionDto.dateId} not found`);
    }
    const promotion = await this.promotionService.findOneByID(updateTourPromotionDto.promotionId);
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${updateTourPromotionDto.promotionId} not found`);
    }

    await this.tourPromotionRepository.update(id, {
      date: startEndDate,
      promotion: promotion,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tourPromotion = await this.findOne(id);
    if (!tourPromotion) {
      throw new NotFoundException(`TourPromotion with id ${id} not found`);
    }
    await this.tourPromotionRepository.delete(id);
  }
}
