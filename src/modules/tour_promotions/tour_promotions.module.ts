import { Module } from '@nestjs/common';
import { TourPromotionsService } from './tour_promotions.service';
import { TourPromotionsController } from './tour_promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourPromotionEntity } from './entities/tour_promotion.entity';
import { StartEndDatesModule } from '../start_end_dates/start_end_dates.module';
import { PromotionsModule } from '../promotions/promotions.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([TourPromotionEntity]),
    StartEndDatesModule,
    PromotionsModule,
  ],
  controllers: [TourPromotionsController],
  providers: [TourPromotionsService],
  exports: [TourPromotionsService],
})
export class TourPromotionsModule { }
