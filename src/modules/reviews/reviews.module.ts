import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ToursModule } from '../tours/tours.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { UserModule } from '../user/user.module';
import { BookingsModule } from '../bookings/bookings.module';
import { StartEndDatesModule } from '../start_end_dates/start_end_dates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity]),
    UserModule,
    ToursModule,
    BookingsModule,

  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule { }
