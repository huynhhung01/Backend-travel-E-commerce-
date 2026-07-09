import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { CheckoutEntity } from './entities/checkout.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class CheckoutsService {
  constructor(
    @InjectRepository(CheckoutEntity)
    private checkoutsRepository: Repository<CheckoutEntity>,
    private bookingService: BookingsService,
  ) {

  }
  async create(createCheckoutDto: CreateCheckoutDto): Promise<CheckoutEntity> {
    const booking = await this.bookingService.findOne(createCheckoutDto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${createCheckoutDto.bookingId} not found`);
    }

    // const checkout = this.checkoutsRepository.create(createCheckoutDto);
    return this.checkoutsRepository.save({
      ...createCheckoutDto,
      booking: booking,
    });
  }

  async findAll(): Promise<CheckoutEntity[]> {
    return this.checkoutsRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[CheckoutEntity[], number]> {
    const query = this.checkoutsRepository.createQueryBuilder('checkout');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, paymentMethod: string, paymentStatus: string, transactionId: string, bookingId: string): Promise<[CheckoutEntity[], number]> {
    const query = this.checkoutsRepository.createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.booking', 'booking');
    // .leftJoinAndSelect('booking.user', 'user')
    // .leftJoinAndSelect('booking.tour', 'tour')
    // .leftJoinAndSelect('booking.date', 'date');
    if (paymentMethod) {
      query.andWhere('checkout.paymentMethod LIKE :paymentMethod', { paymentMethod: `%${paymentMethod}%` });
    }
    if (paymentStatus) {
      query.andWhere('checkout.paymentStatus LIKE :paymentStatus', { paymentStatus: `%${paymentStatus}%` });
    }
    if (transactionId) {
      query.andWhere('checkout.transactionId LIKE :transactionId', { transactionId: `%${transactionId}%` });
    }
    if (bookingId) {
      query.andWhere('checkout.bookingId = :bookingId', { bookingId: bookingId });
    }
    query.orderBy('checkout.checkoutId', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [dataCheckouts, total] = await query.getManyAndCount();
    return [dataCheckouts, total];
  }
  async findOne(id: number): Promise<CheckoutEntity> {
    const checkout = await this.checkoutsRepository.findOne({ where: { checkoutId: id } });
    if (!checkout) {
      throw new NotFoundException(`Checkout with id ${id} not found`);
    }
    return checkout;
  }

  async update(id: number, updateCheckoutDto: UpdateCheckoutDto): Promise<CheckoutEntity> {
    const check = await this.findOne(id);
    if (!check) {
      throw new NotFoundException(`Checkout with id ${id} not found`);
    }
    const booking = await this.bookingService.findOneByID(updateCheckoutDto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${updateCheckoutDto.bookingId} not found`);
    }
    await this.checkoutsRepository.update(id, {
      paymentMethod: updateCheckoutDto.paymentMethod,
      amount: updateCheckoutDto.amount,
      paymentStatus: updateCheckoutDto.paymentStatus,
      transactionId: updateCheckoutDto.transactionId,
      booking: booking,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const check = await this.findOne(id);
    if (!check) {
      throw new NotFoundException(`Checkout with id ${id} not found`);
    }
    await this.checkoutsRepository.delete(id);
  }
}
