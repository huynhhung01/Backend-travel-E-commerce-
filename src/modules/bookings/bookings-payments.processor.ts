import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PaymentBookingDto } from './dto/paymentBooking.dto';
import { CancelBookingDto } from './dto/cancelBooking.dto';
import { BookingsService } from './bookings.service';

@Processor('booking-payments')
export class BookingsPaymentsProcessor {
  constructor(private readonly bookingsService: BookingsService) { }

  // Xử lý job thanh toán booking bằng coin với concurrency 5
  @Process({ name: 'pay-coin-booking', concurrency: 5 })
  async handlePayCoinBooking(job: Job<PaymentBookingDto>) {
    return this.bookingsService.processPayCoinBooking(job.data);
  }
}

@Processor('booking-cancellations')
export class BookingsCancellationsProcessor {
  constructor(private readonly bookingsService: BookingsService) { }

  // Xử lý job hủy booking với concurrency 5
  @Process({ name: 'cancel-booking', concurrency: 5 })
  async handleCancelBooking(job: Job<CancelBookingDto>) {
    return this.bookingsService.processCancelBooking(job.data);
  }
}
