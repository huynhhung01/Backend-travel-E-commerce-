import { Module } from '@nestjs/common';
import { TimelinesService } from './timelines.service';
import { TimelinesController } from './timelines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineEntity } from './entities/timeline.entity';
import { ToursModule } from '../tours/tours.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimelineEntity]),
    ToursModule,
    SupabaseModule,
  ],
  controllers: [TimelinesController],
  providers: [TimelinesService],
  exports: [TimelinesService],
})
export class TimelinesModule { }
