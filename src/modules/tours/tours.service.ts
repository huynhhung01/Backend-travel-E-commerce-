import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from './entities/tour.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { SupabaseService } from '../supabase/supabase.service';
import { OrderByType } from './dto/order-by.enum';
import { ReviewEntity } from '../reviews/entities/review.entity';

@Injectable()
export class ToursService {

  constructor(
    @InjectRepository(TourEntity)
    private toursRepository: Repository<TourEntity>,
    private userService: UserService,
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

  toSlug(title: string): string {
    return title
      .toLowerCase() // chuyển về chữ thường
      .normalize('NFD') // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // xóa dấu tiếng Việt
      .replace(/đ/g, 'd') // chuyển đ → d
      .replace(/[^a-z0-9]+/g, '-') // thay ký tự không phải a-z,0-9 bằng dấu -
      .replace(/^-+|-+$/g, '') // xóa dấu - ở đầu và cuối
      .replace(/-+/g, '-'); // gom nhiều dấu - thành 1
  }

  async create(createTourDto: CreateTourDto, file: Express.Multer.File): Promise<TourEntity> {

    // const tour = this.toursRepository.create(createTourDto);
    try {
      const userSupplier = await this.userService.findOne(createTourDto.userId);
      if (!userSupplier) {
        throw new NotFoundException(`User with id ${createTourDto.userId} not found`);
      }

      let urlimage = "";
      if (file) {
        const bucket = 'image_pbl6';
        const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${this.sanitizeFileName(file.originalname)}`;
        urlimage = await this.supabaseService.uploadImage(file, bucket, path);
      }
      let slug = this.toSlug(createTourDto.title);
      let existingTour = await this.toursRepository.findOne({ where: { slug } });
      let i = 0;
      while (existingTour) {
        slug = `${slug}-${i}`;
        existingTour = await this.toursRepository.findOne({ where: { slug } });
        i++;
      }
      // console.log(urlimage);
      return await this.toursRepository.save({
        title: createTourDto.title,
        slug: slug,
        description: createTourDto.description,
        image: urlimage,
        destination: createTourDto.destination,
        highlight: createTourDto.highlight,
        time: createTourDto.time,
        reviews: createTourDto.reviews,
        domain: createTourDto.domain,
        address: createTourDto.address,
        quantity: createTourDto.quantity,
        countComplete: createTourDto.countComplete ?? 0,
        user: userSupplier,
      });
    } catch (error) {
      // console.error('Supabase upload error:', error);
      // throw new Error('Error uploading images to Supabase');
      console.log(error.message);
      throw error;
    }


  }

  async findAll(): Promise<TourEntity[]> {
    return await this.toursRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[TourEntity[], number]> {
    const query = this.toursRepository.createQueryBuilder('tour');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }


  async FilterPagination(page: number, limit: number, userId: number, slug: string, destination: string, domain: string, time: string, status: string, orderBy: OrderByType): Promise<[TourEntity[], number]> {
    const query = this.toursRepository.createQueryBuilder('tour')
      .leftJoinAndSelect('tour.user', 'user')
      .leftJoinAndSelect('tour.reviewsComment', 'reviews')
      .leftJoinAndSelect('tour.bookings', 'bookings');
    let slug_search = this.toSlug(slug);
    console.log({ slug_search });
    if (userId) {
      query.andWhere('tour.userId = :userId', { userId });
    }
    if (slug_search) {
      query.andWhere('tour.slug LIKE :search', { search: `%${slug_search}%` });
    }
    if (destination) {
      query.andWhere('tour.destination = :destination', { destination });
    }
    if (domain) {
      query.andWhere('tour.domain = :domain', { domain });
    }
    if (time) {
      query.andWhere('tour.time = :time', { time });
    }
    if (status) {
      query.andWhere('tour.status = :status', { status });
    }
    if (orderBy) {
      switch (orderBy) {
        case OrderByType.NEWEST:
          query.orderBy('tour.createDate', 'DESC');
          break;

        case OrderByType.RATING:
          query
            .addSelect('AVG(reviews.rating)', 'avgRating')
            .groupBy('tour.tourId')
            .orderBy('avgRating', 'DESC');
          break;

        case OrderByType.BOOKING:
          query
            .addSelect('COUNT(bookings.bookingId)', 'bookingCount')
            .groupBy('tour.tourId')
            .orderBy('bookingCount', 'DESC');
          break;
        default:
          query.orderBy('tour.tourId', 'DESC'); // mặc định: mới nhất
          break;

      }
    }
    // query.orderBy('tour.tourId', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [dataTours, total] = await query.getManyAndCount();
    return [dataTours, total];
  }

  async addReviewCountAndAvgStar(tourId: number, newRating: number): Promise<TourEntity> {
    const tour = await this.toursRepository.findOne({ where: { tourId } });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${tourId} not found`);
    }
    const totalRating = tour.starAvg * tour.reviewCount;
    const newReviewCount = tour.reviewCount + 1;
    const newAvg = (totalRating + newRating) / newReviewCount;
    tour.reviewCount = newReviewCount;
    tour.starAvg = parseFloat(newAvg.toFixed(2));
    await this.toursRepository.update(tourId, {
      reviewCount: tour.reviewCount,
      starAvg: tour.starAvg,
    });
    return this.findOneByID(tourId) as Promise<TourEntity>;
  }

  async findOne(id: number): Promise<TourEntity | null> {
    const tour = await this.toursRepository.findOne({
      where: { tourId: id },
      relations: ['user'],
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${id} not found`);
    }
    return tour;
  }

  async findOneByID(id: number | undefined): Promise<TourEntity | null> {
    const tour = await this.toursRepository.findOne({
      where: { tourId: id },
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${id} not found`);
    }
    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<TourEntity | null> {
    const tour = await this.toursRepository.findOne({
      where: { tourId: id },
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${id} not found`);
    }

    // const userSupplier = await this.userService.getUserById(updateTourDto.userId);
    // if (!userSupplier) {
    //   throw new NotFoundException(`User with id ${updateTourDto.userId} not found`);
    // }

    let slug = tour.slug;
    if (updateTourDto.title) {
      slug = this.toSlug(updateTourDto.title);
      let existingTour = await this.toursRepository.findOne({ where: { slug } });
      let i = 0;
      while (existingTour && existingTour.tourId !== id) {
        slug = `${slug}-${i}`;
        existingTour = await this.toursRepository.findOne({ where: { slug } });
        i++;
      }
    }
    await this.toursRepository.update(id, {
      title: updateTourDto.title,
      slug: slug,
      description: updateTourDto.description,
      image: updateTourDto.image,
      destination: updateTourDto.destination,
      highlight: updateTourDto.highlight,
      time: updateTourDto.time,
      reviews: updateTourDto.reviews,
      domain: updateTourDto.domain,
      address: updateTourDto.address,
      quantity: updateTourDto.quantity,
      countComplete: updateTourDto.countComplete,
      status: updateTourDto.status,
      // user: userSupplier,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tour = await this.toursRepository.findOne({
      where: { tourId: id },
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${id} not found`);
    }
    await this.toursRepository.delete(id);
  }
}
