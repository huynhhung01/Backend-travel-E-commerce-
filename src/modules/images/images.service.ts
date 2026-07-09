import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ToursService } from '../tours/tours.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ImagesService {

  constructor(
    @InjectRepository(ImageEntity)
    private imagesRepository: Repository<ImageEntity>,
    private toursService: ToursService,
    private supabaseService: SupabaseService,
  ) {

  }

  async create(createImageDto: CreateImageDto, file: Express.Multer.File): Promise<ImageEntity> {
    const tour = await this.toursService.findOne(createImageDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createImageDto.tourId} not found`);
    }

    try {
      const bucket = 'image_pbl6';
      const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.originalname}`;
      const urlimage = await this.supabaseService.uploadImage(file, bucket, path);
      // console.log(urlimage);
      return await this.imagesRepository.save({
        imageURL: urlimage,
        description: createImageDto.description,
        tour: tour,
      });
    } catch (error) {
      // console.error('Supabase upload error:', error);
      throw error;
    }

    // const newImage = this.imagesRepository.create(createImageDto);
    // return await this.imagesRepository.save({
    //   imageURL: createImageDto.imageURL,
    //   description: createImageDto.description,
    //   tour: tour,
    // });
  }

  async createMutipleImage(createImageDto: CreateImageDto, files: Express.Multer.File[]): Promise<ImageEntity[]> {
    const tour = await this.toursService.findOne(createImageDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createImageDto.tourId} not found`);
    }

    const images: ImageEntity[] = [];
    try {
      const bucket = 'image_pbl6';
      await Promise.all(
        files.map(async file => {
          const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.originalname}`;
          const urlimage = this.supabaseService.uploadImage(file, bucket, path);
          images.push(await this.imagesRepository.save({
            imageURL: await urlimage,
            description: createImageDto.description,
            tour: tour,
          }));
        })
      );
    } catch (error) {
      throw error;
    }
    // for (const file of files) {
    //   const newImage = this.imagesRepository.create({
    //     imageURL: file.path,
    //     description: createImageDto.description,
    //     tour: tour,
    //   });
    //   images.push(await this.imagesRepository.save(newImage));
    // }
    return images;
  }

  async findAll(): Promise<ImageEntity[]> {
    return await this.imagesRepository.find();
  }

  async findOne(id: number): Promise<ImageEntity | null> {
    const image = await this.imagesRepository.findOne({
      where: { imageId: id },
    });
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    return image;
  }
  async findImagesByTourId(tourId: number): Promise<ImageEntity[]> {
    const images = await this.imagesRepository.find({
      where: { tour: { tourId: tourId } },
    });
    if (!images || images.length === 0) {
      throw new NotFoundException(`No images found for tour with id ${tourId}`);
    }
    return images;
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<ImageEntity | null> {
    const image = await this.imagesRepository.findOne({
      where: { imageId: id },
    });
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    const tour = await this.toursService.findOneByID(updateImageDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateImageDto.tourId} not found`);
    }

    await this.imagesRepository.update(id, {
      imageURL: updateImageDto.imageURL,
      description: updateImageDto.description,
      tour: tour,
    });
    return await this.imagesRepository.findOne({ where: { imageId: id } });
  }

  async remove(id: number): Promise<void> {
    const image = await this.imagesRepository.findOne({
      where: { imageId: id },
    });
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    await this.imagesRepository.delete(id);
  }
}
