import { Module } from '@nestjs/common';
import { TourHashtagsService } from './tour_hashtags.service';
import { TourHashtagsController } from './tour_hashtags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourHashtagEntity } from './entities/tour_hashtag.entity';
import { ToursModule } from '../tours/tours.module';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TourHashtagEntity]),
    ToursModule,
    HashtagsModule,
  ],
  controllers: [TourHashtagsController],
  providers: [TourHashtagsService],
  exports: [TourHashtagsService],
})
export class TourHashtagsModule { }
