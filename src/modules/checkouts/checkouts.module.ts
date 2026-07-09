import { Module } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CheckoutsController } from './checkouts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from '../bookings/bookings.module';
import { CheckoutEntity } from './entities/checkout.entity';
import { BookingEntity } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutEntity]),
    BookingsModule,
  ],
  controllers: [CheckoutsController],
  providers: [CheckoutsService],
  exports: [CheckoutsService],
})
export class CheckoutsModule { }
