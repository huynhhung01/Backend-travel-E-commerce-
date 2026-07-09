import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { UpdateTimelineDto } from './dto/update-timeline.dto';
import { TimelineEntity } from './entities/timeline.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ToursService } from '../tours/tours.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TimelinesService {

  constructor(
    @InjectRepository(TimelineEntity)
    private timelinesRepository: Repository<TimelineEntity>,
    private tourService: ToursService,
    private supabaseService: SupabaseService,
  ) {

  }

  sanitizeFileName(filename) {
    return filename
      .normalize("NFD")               // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/\s+/g, "_")            // thay khoảng trắng bằng _
      .replace(/[^a-zA-Z0-9._-]/g, ""); // xóa ký tự đặc biệt
  }

  async create(createTimelineDto: CreateTimelineDto, file: Express.Multer.File): Promise<TimelineEntity> {

    try {
      const tour = await this.tourService.findOne(createTimelineDto.tourId);
      if (!tour) {
        throw new NotFoundException(`Tour with id ${createTimelineDto.tourId} not found`);
      }
      let urlimage = "";
      if (file) {
        const bucket = 'image_pbl6';
        const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${this.sanitizeFileName(file.originalname)}`;
        urlimage = await this.supabaseService.uploadImage(file, bucket, path);
      }
      // const timeline = this.timelinesRepository.create(createTimelineDto);
      return await this.timelinesRepository.save({
        tl_title: createTimelineDto.tl_title,
        tl_placeName: createTimelineDto.tl_placeName,
        tl_description: createTimelineDto.tl_description,
        imageTimeLine: urlimage,
        tour: tour,
      });
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async findAll(): Promise<TimelineEntity[]> {
    return await this.timelinesRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[TimelineEntity[], number]> {
    const query = this.timelinesRepository.createQueryBuilder('timeline');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, tourId: number): Promise<[TimelineEntity[], number]> {
    const query = this.timelinesRepository.createQueryBuilder('timeline')
    // .leftJoinAndSelect('timeline.tour', 'tour');

    query.andWhere('timeline.tourId = :tourId', { tourId });

    query.orderBy('timeline.timeLineId', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [dataTimelines, total] = await query.getManyAndCount();
    return [dataTimelines, total];
  }

  async findOne(id: number): Promise<TimelineEntity> {
    const timeline = await this.timelinesRepository.findOne({
      where: { timeLineId: id },
    });
    if (!timeline) {
      throw new NotFoundException(`Timeline with id ${id} not found`);
    }
    return timeline;
  }

  async update(id: number, updateTimelineDto: UpdateTimelineDto): Promise<TimelineEntity | null> {
    const timeline = await this.timelinesRepository.findOne({
      where: { timeLineId: id },
    });
    if (!timeline) {
      throw new NotFoundException(`Timeline with id ${id} not found`);
    }
    const tour = await this.tourService.findOneByID(updateTimelineDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateTimelineDto.tourId} not found`);
    }

    await this.timelinesRepository.update(id, {
      tl_title: updateTimelineDto.tl_title,
      tl_description: updateTimelineDto.tl_description,
      tl_placeName: updateTimelineDto.tl_placeName,
      tour: tour,
    });
    return await this.timelinesRepository.findOne({
      where: { timeLineId: id },
    });
  }

  async updateImage(timeLineId: number, file: Express.Multer.File): Promise<TimelineEntity | null> {
    try {
      const timeline = await this.timelinesRepository.findOne({
        where: { timeLineId: timeLineId },
      });
      if (!timeline) {
        throw new NotFoundException(`Timeline with id ${timeLineId} not found`);
      }

      let urlimage = "";
      if (file) {
        const bucket = 'image_pbl6';
        const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${this.sanitizeFileName(file.originalname)}`;
        urlimage = await this.supabaseService.uploadImage(file, bucket, path);
      }
      // const timeline = this.timelinesRepository.create(createTimelineDto);
      await this.timelinesRepository.update(timeLineId, {
        imageTimeLine: urlimage,
      });
      return await this.timelinesRepository.findOne({
        where: { timeLineId: timeLineId },
      });

      // return await this.timelinesRepository.findOne({
      //   where: { timeLineId: timeLineId },
      // });
    } catch (error) {
      throw error;
    }

  }

  async remove(id: number): Promise<void> {
    const timeline = await this.timelinesRepository.findOne({
      where: { timeLineId: id },
    });
    if (!timeline) {
      throw new NotFoundException(`Timeline with id ${id} not found`);
    }
    await this.timelinesRepository.delete(id);
  }
}
