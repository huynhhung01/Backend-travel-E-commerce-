import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStartEndDateDto } from './dto/create-start_end_date.dto';
import { UpdateStartEndDateDto } from './dto/update-start_end_date.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ToursService } from '../tours/tours.service';
import { StartEndDateEntity } from './entities/start_end_date.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StartEndDatesService {
  constructor(
    @InjectRepository(StartEndDateEntity)
    private startEndDatesRepository: Repository<StartEndDateEntity>,
    private tourService: ToursService,
    // private locationService: LocationService,
  ) {

  }

  async create(createStartEndDateDto: CreateStartEndDateDto): Promise<StartEndDateEntity> {
    const tour = await this.tourService.findOneByID(createStartEndDateDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createStartEndDateDto.tourId} not found`);
    }

    createStartEndDateDto.availability = createStartEndDateDto.quantity;
    // const startEndDate = this.startEndDatesRepository.create(createStartEndDateDto);

    return this.startEndDatesRepository.save({
      ...createStartEndDateDto,
      tour: tour,
    });
  }

  async findAll(): Promise<StartEndDateEntity[]> {
    return this.startEndDatesRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[StartEndDateEntity[], number]> {
    const query = this.startEndDatesRepository.createQueryBuilder('startEndDate');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async findPriceTour(TourId: number): Promise<any> {
    try {
      // const prices = await this.startEndDatesRepository.find({
      //   where: { tour: { tourId: TourId } },
      // });
      // return prices;
      const result = await this.startEndDatesRepository
        .createQueryBuilder('startEndDate')
        // .innerJoin('startEndDate.tour', 'tour') // join relation
        .select('MAX(startEndDate.priceAdult)', 'maxPriceAdult')
        .addSelect('MIN(startEndDate.priceAdult)', 'minPriceAdult')
        .addSelect('MAX(startEndDate.priceChildren)', 'maxPriceChildren')
        .addSelect('MIN(startEndDate.priceChildren)', 'minPriceChildren')
        .where('startEndDate.tourId = :tourId', { tourId: TourId })
        // .where('startEndDate.startDate >= CURRENT_DATE')
        .andWhere('MONTH(startEndDate.startDate) = MONTH(CURRENT_DATE())')
        .andWhere('YEAR(startEndDate.startDate) = YEAR(CURRENT_DATE())')
        .getRawOne();

      // console.log(result);
      return result;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async filterPagination(page: number, limit: number, tourId: number, minpriceAdult: number, maxpriceAdult: number, minpriceChildren: number, maxpriceChildren: number): Promise<[StartEndDateEntity[], number]> {
    const query = this.startEndDatesRepository.createQueryBuilder('startEndDate')
      .leftJoinAndSelect('startEndDate.tour', 'tour');
    if (tourId) {
      query.andWhere('startEndDate.tourId = :tourId', { tourId });
    }
    if (minpriceAdult) {
      query.andWhere('startEndDate.priceAdult >= :minpriceAdult', { minpriceAdult });
    }
    if (maxpriceAdult) {
      query.andWhere('startEndDate.priceAdult <= :maxpriceAdult', { maxpriceAdult });
    }
    if (minpriceChildren) {
      query.andWhere('startEndDate.priceChildren >= :minpriceChildren', { minpriceChildren });
    }
    if (maxpriceChildren) {
      query.andWhere('startEndDate.priceChildren <= :maxpriceChildren', { maxpriceChildren });
    }
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }


  async findOne(id: number): Promise<StartEndDateEntity | null> {
    return this.startEndDatesRepository.findOne({ where: { dateId: id } });
  }
  async findOneStartEndDate(id: number): Promise<StartEndDateEntity | null> {
    const startEndDate = await this.startEndDatesRepository.findOne({ where: { dateId: id } });
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${id} not found`);
    }
    return startEndDate;
  }

  async findOneByID(id: number | undefined): Promise<StartEndDateEntity | null> {
    return this.startEndDatesRepository.findOne({ where: { dateId: id } });
  }

  async updateAvailabilityAfterBooking(id: number, numAdults: number, numChildren: number): Promise<void> {
    const startEndDate = await this.findOneByID(id);
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${id} not found`);
    }
    const newAvailability = startEndDate.availability - (numAdults + numChildren);
    if (newAvailability < 0) {
      throw new Error('Not enough availability for the booking');
    }
    await this.startEndDatesRepository.update(id, { availability: newAvailability });

  }

  async checkAvailability(id: number, numAdults: number, numChildren: number): Promise<any> {
    const startEndDate = await this.findOneByID(id);
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${id} not found`);
    }
    return {
      checkAvailable: startEndDate.availability >= (numAdults + numChildren),
      Availability: startEndDate.availability
    };
  }
  async update(id: number, updateStartEndDateDto: UpdateStartEndDateDto): Promise<StartEndDateEntity | null> {
    const tour = await this.tourService.findOneByID(updateStartEndDateDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateStartEndDateDto.tourId} not found`);
    }

    await this.startEndDatesRepository.update(id, {
      startDate: updateStartEndDateDto.startDate,
      endDate: updateStartEndDateDto.endDate,
      priceAdult: updateStartEndDateDto.priceAdult,
      priceChildren: updateStartEndDateDto.priceChildren,
      quantity: updateStartEndDateDto.quantity,
      availability: updateStartEndDateDto.availability,
      tour: tour,
    });
    return this.findOne(id);

  }

  async remove(id: number): Promise<void> {
    const startEndDate = await this.findOne(id);
    if (!startEndDate) {
      throw new NotFoundException(`StartEndDate with id ${id} not found`);
    }
    await this.startEndDatesRepository.delete(id);
  }
}
