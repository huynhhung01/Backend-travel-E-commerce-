import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { BookingStatus, CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction } from 'typeorm';
import { BookingEntity } from './entities/booking.entity';
import { UserService } from '../user/user.service';
import { StartEndDatesService } from '../start_end_dates/start_end_dates.service';
import { ToursService } from '../tours/tours.service';
import { TransactionsCoinsService } from '../transactions-coins/transactions-coins.service';
import { CreateTransactionsCoinDto } from '../transactions-coins/dto/create-transactions-coin.dto';
import { AccountsService } from '../accounts/accounts.service';
import { PaymentBookingDto } from './dto/paymentBooking.dto';
import { CancelBookingDto } from './dto/cancelBooking.dto';
import { TransactionType } from '../transactions-coins/entities/transactions-coin.entity';
// import e from 'express';
import { MailService } from '../mail/mail.service';
import { UserEntity } from '../user/entities/user.entity';
import { FireBaseService } from '../fire-base/fire-base.service';
import { StartEndDateEntity } from '../start_end_dates/entities/start_end_date.entity';

import { EventsGateway } from '../../gateway/events.gateway';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingsRepository: Repository<BookingEntity>,
    private userService: UserService,
    private tourService: ToursService,
    @InjectRepository(StartEndDateEntity)
    private startEndDatesRepository: Repository<StartEndDateEntity>,
    private startEndDatesService: StartEndDatesService,
    private couponsService: CouponsService,
    private transactioncoinsService: TransactionsCoinsService,
    private accountService: AccountsService,
    private mailService: MailService,
    private firebaseService: FireBaseService,
    private eventsGateway: EventsGateway,
    @InjectQueue('booking-payments') private readonly bookingPaymentsQueue: Queue,
    @InjectQueue('booking-cancellations') private readonly bookingCancellationsQueue: Queue,
    // private locationService: LocationService,
  ) { }

  async create(createBookingDto: CreateBookingDto): Promise<BookingEntity> {
    const user = await this.userService.getUserById(createBookingDto.userId);
    if (!user) {
      throw new NotFoundException(
        `User with id ${createBookingDto.userId} not found`,
      );
    }
    const tour = await this.tourService.findOne(createBookingDto.tourId);
    if (!tour) {
      throw new NotFoundException(
        `Tour with id ${createBookingDto.tourId} not found`,
      );
    }
    const startEndDate = await this.startEndDatesService.findOne(
      createBookingDto.dateId,
    );
    if (!startEndDate) {
      throw new NotFoundException(
        `StartEndDate with id ${createBookingDto.dateId} not found`,
      );
    }

    // check codeCoupon
    let couponpersend = 0;
    if (createBookingDto.codeCoupon) {
      const coupon = await this.couponsService.getCouponByCode(createBookingDto.codeCoupon);
      if (coupon) {
        couponpersend = coupon.discount;
      }
    }
    // tính tổng tiền
    let totalPrice = 0;
    totalPrice += (createBookingDto.numAdults || 0) * startEndDate.priceAdult;
    totalPrice +=
      (createBookingDto.numChildren || 0) * startEndDate.priceChildren;
    createBookingDto.totalPrice = totalPrice * (1 - couponpersend / 100);

    // ⭐ Lưu booking vào DB
    const savedBooking = await this.bookingsRepository.save({
      ...createBookingDto,
      user: user,
      tour: tour,
      date: startEndDate,
    });

    // 🔥 Emit realtime booking mới
    this.eventsGateway.server.emit('new_booking', savedBooking);

    return savedBooking;
  }

  async findAll(): Promise<BookingEntity[]> {
    return this.bookingsRepository.find();
  }

  async findAllPagination(
    page: number,
    limit: number,
  ): Promise<[BookingEntity[], number]> {
    const query = this.bookingsRepository.createQueryBuilder('booking');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async findAllPagination_Start_end_date(
    page: number,
    limit: number,
    dateId: number,
    bookingStatus: string,
  ): Promise<[any, number]> {
    const query = this.startEndDatesRepository
      .createQueryBuilder('startEndDate')
      .leftJoinAndSelect('startEndDate.bookings', 'booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('startEndDate.tour', 'tour');

    if (dateId) {
      query.andWhere('startEndDate.dateId = :dateId', { dateId });
    }
    if (bookingStatus) {
      query.andWhere('booking.bookingStatus = :bookingStatus', {
        bookingStatus,
      });
    }
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }
  async filterPagination(
    page: number,
    limit: number,
    userId: number,
    supplierId: number,
    dateId: number,
    fullName: string,
    email: string,
    phoneNumber: string,
    bookingStatus: string,
  ): Promise<[BookingEntity[], number]> {
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.tour', 'tour')
      .leftJoinAndSelect('tour.user', 'tourSupplierUser')
      .leftJoinAndSelect('booking.date', 'date');
    if (userId) {
      query.andWhere('user.userId = :userId', { userId });
    }
    if (supplierId) {
      query.andWhere('tourSupplierUser.userId = :supplierId', { supplierId });
    }
    if (dateId) {
      query.andWhere('date.dateId = :dateId', { dateId });
    }
    if (fullName) {
      query.andWhere('user.fullName LIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }
    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }
    if (phoneNumber) {
      query.andWhere('user.phoneNumber LIKE :phoneNumber', {
        phoneNumber: `%${phoneNumber}%`,
      });
    }
    if (bookingStatus) {
      query.andWhere('booking.bookingStatus = :bookingStatus', {
        bookingStatus,
      });
    }

    query.orderBy('booking.bookingId', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [dataBookings, total] = await query.getManyAndCount();
    return [dataBookings, total];
  }

  async findOne(id: number): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
      relations: ['user', 'tour', 'date'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return booking;
  }
  async findOneByID(id: number | undefined): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return booking;
  }

  async findOneByUserIdAndTourId(
    userId: number,
    tourId: number,
  ): Promise<BookingEntity | null> {
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.date', 'date')
      .leftJoinAndSelect('date.tour', 'tour')
      .andWhere('user.userId = :userId', { userId })
      .andWhere('tour.tourId = :tourId', { tourId });

    return query.getOne();
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const user = await this.userService.getUserById(updateBookingDto.userId);
    if (!user) {
      throw new NotFoundException(
        `User with id ${updateBookingDto.userId} not found`,
      );
    }
    const tour = await this.tourService.findOneByID(updateBookingDto.tourId);
    if (!tour) {
      throw new NotFoundException(
        `Tour with id ${updateBookingDto.tourId} not found`,
      );
    }
    const startEndDate = await this.startEndDatesService.findOneByID(
      updateBookingDto.dateId,
    );
    if (!startEndDate) {
      throw new NotFoundException(
        `StartEndDate with id ${updateBookingDto.dateId} not found`,
      );
    }

    // console.log(updateBookingDto);
    await this.bookingsRepository.update(id, {
      fullName: updateBookingDto.fullName,
      email: updateBookingDto.email,
      phoneNumber: updateBookingDto.phoneNumber,
      address: updateBookingDto.address,
      // bookingDate: updateBookingDto.bo,
      numAdults: updateBookingDto.numAdults,
      numChildren: updateBookingDto.numChildren,
      totalPrice: updateBookingDto.totalPrice,
      bookingStatus: updateBookingDto.bookingStatus,
      receiveEmail: updateBookingDto.receiveEmail,
      user: user,
      tour: tour,
      date: startEndDate,
    });
    return this.findOne(id);
  }

  async updateStatus(id: number, status: string): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    await this.bookingsRepository.update(id, {
      bookingStatus: status,
    });
    return this.findOne(id);
  }

  async getPriceBookingCancel(id: number): Promise<any> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    console.log(id);
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      // .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.date', 'date')
      .leftJoinAndSelect('date.tour', 'tour')
      .leftJoinAndSelect('tour.user', 'user')
      .andWhere('booking.bookingId = :bookingId', {
        bookingId: booking.bookingId,
      });
    // .leftJoinAndSelect('booking.date', 'date');
    const bookingQuery = await query.getOne();
    if (!bookingQuery) {
      throw new NotFoundException(`bookingQuery with id ${id} not found`);
    }
    const date = new Date(bookingQuery.date.startDate).getTime() - Date.now();
    const diffDays = Math.floor(date / (1000 * 60 * 60 * 24)); // số ngày chênh lệch
    console.log({ diffDays });
    let totalPrice = booking.totalPrice;

    if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
      return { message: 'Booking is not in CONFIRMED status' };
    }
    if (booking.bookingStatus === BookingStatus.CONFIRMED && diffDays < 7) {
      // return { message: 'Cannot cancel a confirmed booking after the start date' };
      // throw new NotFoundException(`Cannot cancel a confirmed booking less than 7 days before the start date`);
      return {
        message:
          'Cannot cancel a confirmed booking less than 7 days before the start date',
      };
    }
    if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      diffDays >= 7 &&
      diffDays < 14
    ) {
      // return { message: 'Cannot cancel a confirmed booking after the start date' };
      totalPrice = totalPrice * 0.3; // hoàn lại 30% giá trị booking
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      diffDays >= 14 &&
      diffDays < 21
    ) {
      totalPrice = totalPrice * 0.5; // hoàn lại 50% giá trị booking
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      diffDays >= 21 &&
      diffDays < 30
    ) {
      totalPrice = totalPrice * 0.7; // hoàn lại 70% giá trị booking
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      diffDays >= 30
    ) {
      totalPrice = totalPrice; // hoàn lại 90% giá trị booking
    }
    return { priceToRefund: totalPrice };
  }

  async queuedCancelBooking(cancelBookingDto: CancelBookingDto): Promise<{ jobId: string | number; bookingId: number }> {

    if (cancelBookingDto.SupplierCancel == false) {
      const user = await this.userService.getUserById(cancelBookingDto.userId);
      if (!user) {
        throw new NotFoundException(
          `User with id ${cancelBookingDto.userId} not found`,
        );
      }

      this.firebaseService.sendToSpecificTokenUser(
        user.userId,
        'Yêu cầu hủy tour đang được xử lý',
        'Yêu cầu hủy tour của bạn đang được xử lý.',
      );
    }

    const booking = await this.findOne(cancelBookingDto.bookingId);
    if (!booking) {
      throw new NotFoundException(
        `Booking with id ${cancelBookingDto.bookingId} not found`,
      );
    }

    if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
      throw new NotFoundException('Booking is not in CONFIRMED status');
    }


    const job = await this.bookingCancellationsQueue.add('cancel-booking', cancelBookingDto, {
      attempts: 1,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: false,
      removeOnFail: false,  // ⭐ Giữ job ngay cả khi thất bại để client có thể kiểm tra status
    });

    return { jobId: job.id, bookingId: cancelBookingDto.bookingId };
  }

  async getCancelJobStatus(jobId: string): Promise<any> {
    const job = await this.bookingCancellationsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      jobId: job.id,
      state,
      progress,
      bookingId: job.data.bookingId,
      result: state === 'completed' ? result : null,
      error: state === 'failed' ? failedReason : null,
    };
  }

  // Thực thi thực sự: được gọi bởi queue processor
  async processCancelBooking(cancelBookingDto: CancelBookingDto): Promise<BookingEntity> {
    try {
      const id = cancelBookingDto.bookingId;

      const booking = await this.bookingsRepository.findOne({
        where: { bookingId: id },
        relations: ['user', 'date', 'date.tour', 'date.tour.user'],
      });
      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }

      const userBooking = (await this.userService.getUserById(
        booking.user.userId,
      )) as UserEntity;

      const query = this.bookingsRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.date', 'date')
        .leftJoinAndSelect('date.tour', 'tour')
        .leftJoinAndSelect('tour.user', 'user')
        .andWhere('booking.bookingId = :bookingId', { bookingId: id });

      const bookingQuery = await query.getOne();
      if (!bookingQuery) {
        throw new NotFoundException(`bookingQuery with id ${id} not found`);
      }

      // if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
      //   throw new NotFoundException('Booking is not in CONFIRMED status');
      // }

      let totalPrice = booking.totalPrice;
      if (cancelBookingDto.SupplierCancel == false) {
        const date = new Date(bookingQuery.date.startDate).getTime() - Date.now();
        const diffDays = Math.floor(date / (1000 * 60 * 60 * 24));
        console.log({ diffDays });

        if (booking.bookingStatus === BookingStatus.CONFIRMED && diffDays < 7) {
          throw new NotFoundException(
            `Cannot cancel a confirmed booking less than 7 days before the start date`,
          );
        }


        if (
          booking.bookingStatus === BookingStatus.CONFIRMED &&
          diffDays > 7 &&
          diffDays <= 14
        ) {
          totalPrice = totalPrice * 0.3;
        } else if (
          booking.bookingStatus === BookingStatus.CONFIRMED &&
          diffDays > 14 &&
          diffDays <= 21
        ) {
          totalPrice = totalPrice * 0.5;
        } else if (
          booking.bookingStatus === BookingStatus.CONFIRMED &&
          diffDays > 21 &&
          diffDays <= 30
        ) {
          totalPrice = totalPrice * 0.7;
        } else if (
          booking.bookingStatus === BookingStatus.CONFIRMED &&
          diffDays > 30
        ) {
          totalPrice = totalPrice;
        }
      }

      const toAccountByUserId = await this.accountService.findByUserId(
        userBooking.userId,
      );
      if (!toAccountByUserId) {
        throw new NotFoundException(
          `Account with user id ${userBooking.userId} not found`,
        );
      }

      const fromAccountByUserId = await this.accountService.findByUserId(
        bookingQuery.date.tour.user.userId,
      );
      if (!fromAccountByUserId) {
        throw new NotFoundException(
          `Account with user id ${bookingQuery.date.tour.user.userId} not found`,
        );
      }

      const createTransactionsCoinDto: CreateTransactionsCoinDto = {
        fromAccount: fromAccountByUserId.id,
        toAccount: toAccountByUserId.id,
        amount: totalPrice,
        description: 'hoàn tiền cho booking id ' + id,
        type: TransactionType.HOAN_TIEN,
        bookingId: booking.bookingId,
      };

      const transaction = await this.transactioncoinsService.create(
        createTransactionsCoinDto,
      );

      if (transaction.status == 'SUCCESS') {
        await this.bookingsRepository.update(booking.bookingId, {
          bookingStatus: BookingStatus.CANCELED,
        });

        await this.startEndDatesService.updateAvailabilityAfterBooking(
          booking.date.dateId,
          -booking.numAdults,
          -booking.numChildren,
        );

        this.firebaseService.sendToSpecificTokenUser(
          userBooking.userId,
          'Hủy Tour Thành Công',
          'Tour của bạn đã được hủy thành công.',
        );

        console.log('Gửi email hủy tour đến người dùng');
        console.log(`Booking ID: ${bookingQuery.bookingId}`);
        console.log(`Tour title: ${bookingQuery.date.tour.title}`);

        const messageSendMailUserFrom = `<div style="font-family: Arial, sans-serif; padding: 16px; line-height: 1.6; color: #333;">
  <h2 style="color: #d9534f;">Hủy Tour Thành Công</h2>

  <p>Xin chào,</p>

  <p> tour của bạn đã được hủy. Dưới đây là thông tin chi tiết:</p>

  <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #ddd;">
    <p><strong>ID đơn đặt tour:</strong> ${bookingQuery.bookingId}</p>
    <p><strong>Tên tour:</strong> ${bookingQuery.date.tour.title}</p>
  </div>

  <p>Chúng tôi rất tiếc khi tour của bạn phải hủy. Nếu có bất kỳ yêu cầu hỗ trợ nào khác, bạn vui lòng liên hệ lại với chúng tôi.</p>

  <p>Cảm ơn bạn đã sử dụng <strong>OurTravel</strong>!</p>

  <p>Trân trọng,<br>
  <strong>OurTravel Team</strong></p>
  </div>
  `;

        console.log(`userBooking.email : ${userBooking.email}`);

        await this.mailService.sendNotificationMail(
          userBooking.email,
          messageSendMailUserFrom,
        );

        // await this.mailService.sendNotificationMail(
        //   booking.email,
        //   messageSendMailUserFrom,
        // );



        const updatedBooking = await this.findOne(booking.bookingId);

        // 🔥 Emit realtime
        this.eventsGateway.server.emit('booking_status_changed', updatedBooking);
        this.eventsGateway.server.emit('cancel_completed', {
          bookingId: cancelBookingDto.bookingId,
          status: 'success',
          booking: updatedBooking,
        });

        return updatedBooking;
      }

      return this.findOne(booking.bookingId);
    } catch (error) {
      this.eventsGateway.server.emit('cancel_completed', {
        bookingId: cancelBookingDto.bookingId,
        status: 'failed',
        error: error.message,
      });
      throw error;
    }
  }

  async SupplierCancelBookingUser(id: number): Promise<any> {
    try {
      const booking = await this.bookingsRepository.findOne({
        where: { bookingId: id },
      });
      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }
      const cancelBookingDto: CancelBookingDto = {
        bookingId: booking.bookingId,
        userId: 0, // không cần userId khi hủy bởi supplier
        SupplierCancel: true,
      };
      const job = await this.queuedCancelBooking(cancelBookingDto);
      console.log('job:', job);
      return { message: 'Supplier cancel completed for bookingId ' + id, jobId: job };

    } catch (error) {
      throw error;
    }
  }

  async SupplierCancelBooking(id: number): Promise<any> {
    try {
      const bookingIds = this.bookingsRepository
        .createQueryBuilder('booking')
        // .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.date', 'date')
        .andWhere('date.dateId = :dateId', {
          dateId: id,
        })
        .andWhere('booking.bookingStatus = :bookingStatus', {
          bookingStatus: BookingStatus.CONFIRMED,
        })
        .select('booking.bookingId')
        .getRawMany();

      const listJobIds: any[] = [];
      for (const bookingId of await bookingIds) {
        const cancelBookingDto: CancelBookingDto = {
          bookingId: bookingId.booking_bookingId,
          userId: 0, // không cần userId khi hủy bởi supplier
          SupplierCancel: true,
        };
        console.log('cancelBookingDto:', cancelBookingDto);
        // await this.processCancelBooking(cancelBookingDto);
        const job = await this.queuedCancelBooking(cancelBookingDto);
        console.log('job:', job);
        listJobIds.push(job);
      }
      return { message: 'Supplier cancel completed for dateId ' + id, jobIds: listJobIds };
    } catch (error) {
      throw error;
    }
  }

  async payCoinBooking(paymentBookingDto: PaymentBookingDto): Promise<{ jobId: string | number; bookingId: number }> {

    const user = await this.userService.getUserById(paymentBookingDto.userId);
    if (!user) {
      throw new NotFoundException(
        `User with id ${paymentBookingDto.userId} not found`,
      );
    }
    // check availability
    const booking = await this.findOne(paymentBookingDto.bookingId);
    const checkAvailability = await this.startEndDatesService.checkAvailability(
      booking.date.dateId,
      booking.numAdults,
      booking.numChildren,
    );

    if (!checkAvailability.checkAvailable) {
      throw new NotFoundException(
        `Not enough availability for date id ${booking.date.dateId}, availability : ${checkAvailability.Availability}`,
      );
    }
    this.firebaseService.sendToSpecificTokenUser(
      user.userId,
      'Đơn đặt hàng của bạn đang được xử lý',
      'Yêu cầu thanh toán đơn đặt hàng của bạn đang được xử lý.',
    );
    const job = await this.bookingPaymentsQueue.add('pay-coin-booking', paymentBookingDto, {
      attempts: 1,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: false, // Keep job để client có thể check status
      // removeOnFail: true,
      removeOnFail: false,

    });
    return { jobId: job.id, bookingId: paymentBookingDto.bookingId };
  }

  async getPaymentJobStatus(jobId: string): Promise<any> {
    const job = await this.bookingPaymentsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      jobId: job.id,
      state, // 'completed', 'failed', 'active', 'waiting', 'delayed'
      progress,
      bookingId: job.data.bookingId,
      result: state === 'completed' ? result : null,
      error: state === 'failed' ? failedReason : null,
    };
  }

  // Thực thi thực sự: được gọi bởi queue processor
  async processPayCoinBooking(paymentBookingDto: PaymentBookingDto): Promise<BookingEntity> {
    try {
      console.log(
        paymentBookingDto.userId,
        paymentBookingDto.bookingId,
        paymentBookingDto.amount,
        paymentBookingDto.decription,
      );

      const booking = await this.bookingsRepository.findOne({
        where: { bookingId: paymentBookingDto.bookingId },
      });
      if (!booking) {
        throw new NotFoundException(
          `Booking with id ${paymentBookingDto.bookingId} not found`,
        );
      }
      const user = await this.userService.getUserById(paymentBookingDto.userId);
      if (!user) {
        throw new NotFoundException(
          `User with id ${paymentBookingDto.userId} not found`,
        );
      }
      const query = this.bookingsRepository
        .createQueryBuilder('booking')
        // .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.date', 'date')
        .leftJoinAndSelect('date.tour', 'tour')
        .leftJoinAndSelect('tour.user', 'user')
        .andWhere('booking.bookingId = :bookingId', {
          bookingId: paymentBookingDto.bookingId,
        });
      // .leftJoinAndSelect('booking.date', 'date');
      const bookingQuery = await query.getOne();
      if (!bookingQuery) {
        throw new NotFoundException(
          `Booking with id ${paymentBookingDto.bookingId} not found`,
        );
      }
      // console.log(bookingQuery.date.tour.user);
      const fromAccountByUserId = await this.accountService.findByUserId(
        paymentBookingDto.userId,
      );
      if (!fromAccountByUserId) {
        throw new NotFoundException(
          `Account with user id ${paymentBookingDto.userId} not found`,
        );
      }
      const toAccountByUserId = await this.accountService.findByUserId(
        bookingQuery.date.tour.user.userId,
      );
      if (!toAccountByUserId) {
        throw new NotFoundException(
          `Account with user id ${bookingQuery.date.tour.user.userId} not found`,
        );
      }
      const createTransactionsCoinDto: CreateTransactionsCoinDto = {
        fromAccount: fromAccountByUserId.id,
        toAccount: toAccountByUserId.id,
        amount: paymentBookingDto.amount,
        description:
          paymentBookingDto.decription ||
          `Payment for booking id ${paymentBookingDto.bookingId}`,
        type: TransactionType.THANH_TOAN,
        bookingId: paymentBookingDto.bookingId,
      };
      // const transaction = await this.transactioncoinsService.create(
      //   createTransactionsCoinDto,
      // );
      const transaction = await this.transactioncoinsService.create(
        createTransactionsCoinDto,
      );
      if (transaction.status == 'SUCCESS') {
        await this.bookingsRepository.update(paymentBookingDto.bookingId, {
          bookingStatus: BookingStatus.CONFIRMED,
        });
        // update availability in startEndDates
        await this.startEndDatesService.updateAvailabilityAfterBooking(
          bookingQuery.date.dateId,
          bookingQuery.numAdults,
          bookingQuery.numChildren,
        );

        // send notification app
        // get token FCM of user
        this.firebaseService.sendToSpecificTokenUser(
          user.userId,
          'Thanh toán Tour Thành Công',
          'Yêu cầu thanh toán tour của bạn đã được xử lý thành công.',
        );

        const updatedBooking = await this.findOne(paymentBookingDto.bookingId);

        // 🔥 Emit realtime
        this.eventsGateway.server.emit('booking_status_changed', updatedBooking);
        this.eventsGateway.server.emit('dashboard_update', updatedBooking);
        this.eventsGateway.server.emit('payment_completed', {
          bookingId: paymentBookingDto.bookingId,
          status: 'success',
          booking: updatedBooking,
        });

        // gửi email xác nhận đặt tour thành công
        // await this.userService.sendEmailBookingSuccess(user.email, bookingQuery);
        // Gửi mail cho người đặt tour
        // console.log(bookingQuery.bookingId, bookingQuery.tour.title, bookingQuery.date.startDate.toDateString(), bookingQuery.numAdults, bookingQuery.numChildren, bookingQuery.totalPrice);
        // let messageSendMailUserFrom = `Đặt tour thành công!\n`;
        // messageSendMailUserFrom += `Thông tin đặt tour:\n`;
        // messageSendMailUserFrom += `- id đơn đặt tour: ${bookingQuery.bookingId}\n`;
        // messageSendMailUserFrom += `- Tên tour: ${bookingQuery.date.tour.title}\n`;
        // messageSendMailUserFrom += `- Ngày khởi hành: ${bookingQuery.date.startDate.toDateString()}\n`;
        // messageSendMailUserFrom += `- Số người lớn: ${bookingQuery.numAdults}\n`;
        // messageSendMailUserFrom += `- Số trẻ em: ${bookingQuery.numChildren}\n`;
        // messageSendMailUserFrom += `- Tổng giá: ${bookingQuery.totalPrice}\n`;
        // messageSendMailUserFrom += `Cảm ơn bạn đã đặt tour tại OurTravel!\n`;
        const messageSendMailUserFrom = `
<div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 30px;">
    <h2 style="color: #2b6cb0; text-align: center;">🎉 Đặt tour thành công!</h2>

    <p style="font-size: 16px; color: #333;">
      Cảm ơn bạn đã tin tưởng và đặt tour tại 
      <strong style="color: #3182ce;">OurTravel</strong>.<br>
      Dưới đây là thông tin chi tiết đơn đặt tour của bạn:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">🧾 Mã đơn đặt tour:</td>
        <td style="padding: 8px;">${bookingQuery.bookingId}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">📍 Tên tour:</td>
        <td style="padding: 8px;">${bookingQuery.date.tour.title}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">📅 Ngày khởi hành:</td>
        <td style="padding: 8px;">${new Date(bookingQuery.date.startDate).toLocaleDateString('vi-VN')}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">👨‍👩‍👧 Số người lớn:</td>
        <td style="padding: 8px;">${bookingQuery.numAdults}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">🧒 Số trẻ em:</td>
        <td style="padding: 8px;">${bookingQuery.numChildren}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">💰 Tổng giá:</td>
        <td style="padding: 8px; color: #e53e3e; font-weight: bold;">${bookingQuery.totalPrice.toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    </table>

    <p style="margin-top: 25px; font-size: 16px; color: #333;">
      🎒 <strong>Chúc bạn có một chuyến đi tuyệt vời cùng OurTravel!</strong>
    </p>

    <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 30px;">
      — OurTravel Team —
    </p>
  </div>
</div>
       `;
        console.log(user.email);
        await this.mailService.sendNotificationMail(
          user.email,
          messageSendMailUserFrom,
        );

        // Gửi mail cho chủ tour
        // console.log(user.fullName, user.email, user.phoneNumber, bookingQuery.bookingId, bookingQuery.tour.title, bookingQuery.date.startDate.toDateString(), bookingQuery.numAdults, bookingQuery.numChildren, bookingQuery.totalPrice);
        // let messageSendMailUserTo = `Khách đã đặt tour của bạn!\n`;
        // messageSendMailUserTo += `Thông tin đặt tour:\n`;
        // messageSendMailUserTo += `- Khách hàng: ${user.fullName}\n`;
        // messageSendMailUserTo += `- Email: ${user.email}\n`;
        // messageSendMailUserTo += `- Số điện thoại: ${user.phoneNumber}\n`;
        // messageSendMailUserTo += `- id đơn đặt tour: ${bookingQuery.bookingId}\n`;
        // messageSendMailUserTo += `- Tên tour: ${bookingQuery.date.tour.title}\n`;
        // messageSendMailUserTo += `- Ngày khởi hành: ${bookingQuery.date.startDate.toDateString()}\n`;
        // messageSendMailUserTo += `- Số người lớn: ${bookingQuery.numAdults}\n`;
        // messageSendMailUserTo += `- Số trẻ em: ${bookingQuery.numChildren}\n`;
        // messageSendMailUserTo += `- Tổng giá: ${bookingQuery.totalPrice}\n`;
        // messageSendMailUserTo += `Vui lòng liên hệ với khách để biết thêm chi tiết!\n`;
        // messageSendMailUserTo += `Cảm ơn bạn đã sử dụng OurTravel!\n`;
        const messageSendMailUserTo = `
<div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 30px;">
    <h2 style="color: #2b6cb0; text-align: center;">📢 Khách hàng đã đặt tour của bạn!</h2>

    <p style="font-size: 16px; color: #333;">
      Một khách hàng mới đã đặt tour qua hệ thống <strong style="color: #3182ce;">OurTravel</strong>.<br>
      Dưới đây là thông tin chi tiết đơn đặt tour:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">👤 Khách hàng:</td>
        <td style="padding: 8px;">${user.fullName}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">📧 Email:</td>
        <td style="padding: 8px;">${user.email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">📞 Số điện thoại:</td>
        <td style="padding: 8px;">${user.phoneNumber}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">🧾 Mã đơn đặt tour:</td>
        <td style="padding: 8px;">${bookingQuery.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">📍 Tên tour:</td>
        <td style="padding: 8px;">${bookingQuery.date.tour.title}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">📅 Ngày khởi hành:</td>
        <td style="padding: 8px;">${new Date(bookingQuery.date.startDate).toLocaleDateString('vi-VN')}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">👨‍👩‍👧 Số người lớn:</td>
        <td style="padding: 8px;">${bookingQuery.numAdults}</td>
      </tr>
      <tr style="background-color: #f4f7fb;">
        <td style="padding: 8px; font-weight: bold;">🧒 Số trẻ em:</td>
        <td style="padding: 8px;">${bookingQuery.numChildren}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">💰 Tổng giá:</td>
        <td style="padding: 8px; color: #e53e3e; font-weight: bold;">${bookingQuery.totalPrice.toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    </table>

    <p style="margin-top: 25px; font-size: 16px; color: #333;">
      📞 <strong>Vui lòng liên hệ với khách để xác nhận và hỗ trợ thêm chi tiết.</strong>
    </p>

    <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 30px;">
      — OurTravel Team —
    </p>
  </div>
</div>
  `;
        console.log(bookingQuery.date.tour.user.userId);
        await this.mailService.sendNotificationMail(
          bookingQuery.date.tour.user.email,
          messageSendMailUserTo,
        );
      }
      return this.findOne(paymentBookingDto.bookingId);
    } catch (error) {
      // thông báo realtime + push
      this.eventsGateway.server.emit('payment_completed', {
        bookingId: paymentBookingDto.bookingId,
        status: 'failed',
        error: error.message,
      });
      this.firebaseService.sendToSpecificTokenUser(
        paymentBookingDto.userId,
        'Thanh toán thất bại',
        'Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.',
      );
      throw error; // để Bull mark job failed, client poll thấy state = failed
    }
  }

  async remove(id: number): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingId: id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    await this.bookingsRepository.delete(id);
  }
}
