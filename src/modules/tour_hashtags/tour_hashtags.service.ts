import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTourHashtagDto } from './dto/create-tour_hashtag.dto';
import { UpdateTourHashtagDto } from './dto/update-tour_hashtag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TourHashtagEntity } from './entities/tour_hashtag.entity';
import { Repository } from 'typeorm';
import { ToursService } from '../tours/tours.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { CreateHashtagDto } from '../hashtags/dto/create-hashtag.dto';
import { HashtagEntity } from '../hashtags/entities/hashtag.entity';

@Injectable()
export class TourHashtagsService {
  constructor(
    @InjectRepository(TourHashtagEntity)
    private tourHashtagRepository: Repository<TourHashtagEntity>,
    private tourService: ToursService,
    private hashtagService: HashtagsService,
  ) {

  }


  async create(createTourHashtagDto: CreateTourHashtagDto): Promise<TourHashtagEntity> {
    const tour = await this.tourService.findOneByID(createTourHashtagDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createTourHashtagDto.tourId} not found`);
    }
    const hashtag = await this.hashtagService.findOne(createTourHashtagDto.hashtagId);
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${createTourHashtagDto.hashtagId} not found`);
    }
    // const newTourHashtag = this.tourHashtagRepository.create(createTourHashtagDto);
    return this.tourHashtagRepository.save({
      ...createTourHashtagDto,
      tour: tour,
      hashtag: hashtag,
    });
  }

  async createListTourHashtags(tourId: number, createListHashtagsDto: CreateHashtagDto[]): Promise<TourHashtagEntity[]> {
    const tour = await this.tourService.findOneByID(tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${tourId} not found`);
    }
    let createdHashtags: HashtagEntity[] = [];
    createdHashtags = await this.hashtagService.createListHashtags(createListHashtagsDto);
    // console.log({ createdHashtags });
    const createdTourHashtags: TourHashtagEntity[] = [];
    for (const hashtag of createdHashtags) {
      // const tourHashtag = this.tourHashtagRepository.create({
      //   tour: tour,
      //   hashtag: hashtag,
      // });
      const savedTourHashtag = await this.tourHashtagRepository.save({
        tour: tour,
        hashtag: hashtag,
      });
      // console.log({ savedTourHashtag });
      createdTourHashtags.push(savedTourHashtag);
    }
    return createdTourHashtags;
  }

  async findAll(): Promise<TourHashtagEntity[]> {
    return this.tourHashtagRepository.find();
  }

  async FilterPagination(page: number, limit: number, hashtag: string, tourId: number): Promise<any> {
    try {
      const query = this.tourHashtagRepository.createQueryBuilder('tourHashtag')
        .leftJoinAndSelect('tourHashtag.tour', 'tour')
        .leftJoinAndSelect('tourHashtag.hashtag', 'hashtag')
      // .where('tour.status = :status', { status: 'active' })
      if (hashtag) {
        query.andWhere('hashtag.name ILIKE :hashtag', { hashtag: `%${hashtag}%` });
      }
      if (tourId) {
        query.andWhere('tour.tourId = :tourId', { tourId });
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

  async findOne(id: number): Promise<TourHashtagEntity | null> {
    return this.tourHashtagRepository.findOne({ where: {} });
  }

  async findOneTourHashtag(id: number): Promise<TourHashtagEntity | null> {
    const tourHashtag = await this.tourHashtagRepository.findOne({
      where: { tourHashTagId: id },
      relations: ['tour', 'hashtag'],
    });
    if (!tourHashtag) {
      throw new NotFoundException(`TourHashtag with id ${id} not found`);
    }
    return tourHashtag;
  }

  async update(id: number, updateTourHashtagDto: UpdateTourHashtagDto): Promise<TourHashtagEntity | null> {
    const tourHashtag = await this.findOne(id);
    if (!tourHashtag) {
      throw new NotFoundException(`TourHashtag with id ${id} not found`);
    }
    const tour = await this.tourService.findOneByID(updateTourHashtagDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateTourHashtagDto.tourId} not found`);
    }
    const hashtag = await this.hashtagService.findOneByID(updateTourHashtagDto.hashtagId);
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${updateTourHashtagDto.hashtagId} not found`);
    }

    await this.tourHashtagRepository.update(id, {
      tour: tour,
      hashtag: hashtag,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tourHashtag = await this.findOne(id);
    if (!tourHashtag) {
      throw new NotFoundException(`TourHashtag with id ${id} not found`);
    }
    await this.tourHashtagRepository.delete(id);
  }
}
