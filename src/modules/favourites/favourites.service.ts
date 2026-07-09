import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { UpdateFavouriteDto } from './dto/update-favourite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { ToursService } from '../tours/tours.service';
import { FavouriteEntity } from './entities/favourite.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class FavouritesService {

  constructor(
    @InjectRepository(FavouriteEntity)
    private favouritesRepository: Repository<FavouriteEntity>,
    private userService: UserService,
    private tourService: ToursService,
  ) {

  }

  async create(createFavouriteDto: CreateFavouriteDto): Promise<FavouriteEntity> {
    const user = await this.userService.findOne(createFavouriteDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${createFavouriteDto.userId} not found`);
    }
    const tour = await this.tourService.findOneByID(createFavouriteDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${createFavouriteDto.tourId} not found`);
    }
    // const favourite = this.favouritesRepository.create(createFavouriteDto);
    return this.favouritesRepository.save({
      ...createFavouriteDto,
      user: user,
      tour: tour,
    });
  }

  async findAll(): Promise<FavouriteEntity[]> {
    return this.favouritesRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[FavouriteEntity[], number]> {
    const query = this.favouritesRepository.createQueryBuilder('favourite');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, userId: number, tourId: number): Promise<[FavouriteEntity[], number]> {
    const query = this.favouritesRepository.createQueryBuilder('favourite')
      .leftJoinAndSelect('favourite.tour', 'tour');

    if (userId) {
      query.andWhere('favourite.userId = :userId', { userId });
    }

    if (tourId) {
      query.andWhere('favourite.tourId = :tourId', { tourId });
    }

    query.orderBy('favourite.favouriteId', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [dataFavourites, total] = await query.getManyAndCount();
    return [dataFavourites, total];
  }

  async findAllByUserId(page: number, limit: number, userId: number): Promise<[FavouriteEntity[], number]> {
    const query = this.favouritesRepository.createQueryBuilder('favourite')
      .leftJoinAndSelect('favourite.tour', 'tour');

    query.andWhere('favourite.userId = :userId and favourite.statusFavourite = 1', { userId });
    // query.andWhere('favourite.userId = :userId', { userId });


    query.orderBy('favourite.favouriteId', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [dataFavourites, total] = await query.getManyAndCount();
    return [dataFavourites, total];
  }

  async findOne(id: number): Promise<FavouriteEntity | null> {
    const favourite = await this.favouritesRepository.findOne({ where: { favouriteId: id } });
    if (!favourite) {
      throw new NotFoundException(`Favourite with id ${id} not found`);
    }
    return favourite;
  }

  async update(id: number, updateFavouriteDto: UpdateFavouriteDto): Promise<FavouriteEntity | null> {
    const favourite = await this.favouritesRepository.findOne({ where: { favouriteId: id } });
    if (!favourite) {
      throw new NotFoundException(`Favourite with id ${id} not found`);
    }
    const user = await this.userService.getUserById(updateFavouriteDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${updateFavouriteDto.userId} not found`);
    }
    const tour = await this.tourService.findOneByID(updateFavouriteDto.tourId);
    if (!tour) {
      throw new NotFoundException(`Tour with id ${updateFavouriteDto.tourId} not found`);
    }
    await this.favouritesRepository.update(id, {
      statusFavourite: updateFavouriteDto.statusFavourite ?? 1,
      user: user,
      tour: tour,
    });
    return this.favouritesRepository.findOne({ where: { favouriteId: id } });
  }

  async remove(id: number): Promise<void> {
    const favourite = await this.favouritesRepository.findOne({ where: { favouriteId: id } });
    if (!favourite) {
      throw new NotFoundException(`Favourite with id ${id} not found`);
    }
    await this.favouritesRepository.delete(id);
  }
}
