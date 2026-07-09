import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponEntity } from './entities/coupon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CouponsService {

  constructor(
    @InjectRepository(CouponEntity)
    private couponsRepository: Repository<CouponEntity>,
  ) {

  }
  async create(createCouponDto: CreateCouponDto): Promise<CouponEntity> {
    const codeCoupon = await this.couponsRepository.findOne({ where: { codeCoupon: createCouponDto.codeCoupon } });
    if (codeCoupon) {
      throw new NotFoundException(`Code coupon ${createCouponDto.codeCoupon} already exists`);
    }
    // const coupon = this.couponsRepository.create(createCouponDto);
    return this.couponsRepository.save({
      title: createCouponDto.title,
      codeCoupon: createCouponDto.codeCoupon,
      discount: createCouponDto.discount,
      startDate: createCouponDto.startDate,
      endDate: createCouponDto.endDate,
      status: createCouponDto.status ?? 'y',
    });
  }

  async findAll(): Promise<CouponEntity[]> {
    return this.couponsRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[CouponEntity[], number]> {
    const query = this.couponsRepository.createQueryBuilder('coupon');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async findOne(id: number): Promise<CouponEntity | null> {
    return this.couponsRepository.findOne({ where: { couponId: id } });
  }

  async findOneCoupon(id: number): Promise<CouponEntity | null> {
    const coupons = await this.couponsRepository.findOne({ where: { couponId: id } });
    if (!coupons) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    return coupons;
  }

  async getCouponByCode(codeCoupon: string): Promise<CouponEntity | null> {
    return this.couponsRepository.findOne({ where: { codeCoupon: codeCoupon } });
  }

  async update(id: number, updateCouponDto: UpdateCouponDto): Promise<CouponEntity | null> {
    const coupon = await this.couponsRepository.findOne({ where: { couponId: id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    await this.couponsRepository.update(id, {
      title: updateCouponDto.title,
      codeCoupon: updateCouponDto.codeCoupon,
      discount: updateCouponDto.discount,
      startDate: updateCouponDto.startDate,
      endDate: updateCouponDto.endDate,
      status: updateCouponDto.status ?? 'y',
    });
    return this.couponsRepository.findOne({ where: { couponId: id } });
  }

  async remove(id: number): Promise<void> {
    const coupon = await this.couponsRepository.findOne({ where: { couponId: id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    await this.couponsRepository.delete(id);
  }
}
