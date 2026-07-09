import { Module } from '@nestjs/common';
import { StartEndDatesService } from './start_end_dates.service';
import { StartEndDatesController } from './start_end_dates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartEndDateEntity } from './entities/start_end_date.entity';
import { ToursModule } from '../tours/tours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StartEndDateEntity]),
    ToursModule
  ],
  controllers: [StartEndDatesController],
  providers: [StartEndDatesService],
  exports: [StartEndDatesService],
})
export class StartEndDatesModule { }
