import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { ToursService } from '../tours/tours.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewsRepository: Repository<ReviewEntity>,
    private userService: UserService,
    private toursService: ToursService,
    private bookingsService: BookingsService,

    // private locationService: LocationService,
  ) {

  }
  async create(userId: number, createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    const tour = await this.toursService.findOneByID(createReviewDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createReviewDto.tourId} not found`);
    }
    const user = await this.userService.findOne(createReviewDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${createReviewDto.userId} not found`);
    }

    const booking = await this.bookingsService.findOneByUserIdAndTourId(userId, createReviewDto.tourId);
    if (!booking) {
      // throw new NotFoundException(`Booking not found for user id ${userId} and tour id ${createReviewDto.tourId}`);
      // throw new NotFoundException(` user id ${userId} not booked with and tour id ${createReviewDto.tourId}`);
      throw new NotFoundException(`You cannot comment on this tour until you have booked it.`);

    }

    const TourUpdateReviewStarts = await this.toursService.addReviewCountAndAvgStar(createReviewDto.tourId, createReviewDto.rating);
    // const review = this.reviewsRepository.create(createReviewDto);
    return this.reviewsRepository.save({
      ...createReviewDto,
      user: user,
      tour: TourUpdateReviewStarts,
    });
  }

  async findAll(): Promise<ReviewEntity[]> {
    return this.reviewsRepository.find();
  }


  async findAllPagination(page: number, limit: number): Promise<[ReviewEntity[], number]> {
    const query = this.reviewsRepository.createQueryBuilder('review');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, userId: number, tourId: number, rating: number): Promise<[ReviewEntity[], number]> {
    const query = this.reviewsRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.tour', 'tour')
      .leftJoinAndSelect('review.user', 'user');
    if (userId) {
      query.andWhere('review.userId = :userId', { userId });
    }
    if (tourId) {
      query.andWhere('review.tourId = :tourId', { tourId });
    }
    if (rating) {
      query.andWhere('review.rating = :rating', { rating });
    }
    query.orderBy('review.reviewId', 'ASC');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }


  async findOne(id: number): Promise<ReviewEntity | null> {
    const review = await this.reviewsRepository.findOne({ where: { reviewId: id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<ReviewEntity | null> {
    const review = await this.reviewsRepository.findOne({ where: { reviewId: id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    const tour = await this.toursService.findOneByID(updateReviewDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateReviewDto.tourId} not found`);
    }
    const user = await this.userService.getUserById(updateReviewDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${updateReviewDto.userId} not found`);
    }

    await this.reviewsRepository.update(id, {
      rating: updateReviewDto.rating,
      comment: updateReviewDto.comment,
      user: user,
      tour: tour,
    });
    return this.reviewsRepository.findOne({ where: { reviewId: id } });
  }

  async remove(id: number): Promise<void> {
    const review = await this.reviewsRepository.findOne({ where: { reviewId: id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    await this.reviewsRepository.delete(id);
  }
}
