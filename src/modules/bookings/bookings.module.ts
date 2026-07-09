import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { ToursModule } from '../tours/tours.module';
import { UserModule } from '../user/user.module';
import { StartEndDatesModule } from '../start_end_dates/start_end_dates.module';
import { TransactionsCoinsModule } from '../transactions-coins/transactions-coins.module';
import { AccountsModule } from '../accounts/accounts.module';
import { MailModule } from '../mail/mail.module';
import { FireBaseModule } from '../fire-base/fire-base.module';
import { StartEndDateEntity } from '../start_end_dates/entities/start_end_date.entity';
// import { TransactionsModule } from '../transactions/transactions.module';

// ⭐ Thêm đúng module gateway
import { EventsModule } from '../../gateway/events.module';
import { BookingsPaymentsProcessor, BookingsCancellationsProcessor } from './bookings-payments.processor';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, StartEndDateEntity]),
    ToursModule,
    UserModule,
    StartEndDatesModule,
    CouponsModule,
    TransactionsCoinsModule,
    AccountsModule,
    MailModule,
    FireBaseModule,
    EventsModule,
    BullModule.registerQueue({ name: 'booking-payments' }),
    BullModule.registerQueue({ name: 'booking-cancellations' }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsPaymentsProcessor, BookingsCancellationsProcessor],
  exports: [BookingsService],
})
export class BookingsModule { }
