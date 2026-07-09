import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponEntity } from './entities/coupon.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('coupons')   // 👈 nhóm "coupons"
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo coupon mới' })
  @ApiConsumes('application/json')
  // @ApiBody({ type: CreateCouponDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Giảm giá mùa hè', description: 'Tên chương trình khuyến mãi' },
        codeCoupon: { type: 'string', example: 'SUMMER2025', description: 'Mã coupon áp dụng' },
        discount: { type: 'integer', example: 20, minimum: 0, maximum: 100, description: 'Phần trăm giảm giá (0-100)' },
        startDate: { type: 'date', format: 'date', example: '2025-06-01', description: 'Ngày bắt đầu hiệu lực' },
        endDate: { type: 'date', format: 'date', example: '2025-06-30', description: 'Ngày kết thúc hiệu lực' },
        // status: { type: 'string', enum: ['y', 'n'], example: 'y', description: 'Trạng thái coupon (y = hoạt động, n = ngưng)' },
      },
      required: ['title', 'codeCoupon', 'discount', 'startDate', 'endDate']
    }
  })
  async create(@Req() req, @Body() createCouponDto: CreateCouponDto): Promise<ResponseData<CouponEntity>> {
    try {
      return new ResponseData<CouponEntity>(await this.couponsService.create(createCouponDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CouponEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<CouponEntity[]>> {
    try {
      return new ResponseData<CouponEntity[]>(await this.couponsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CouponEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /coupons/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách coupons có phân trang',
    description: '/coupons/GetAllPagination?page=1&limit=10 (API trả về danh sách các mã giảm giá (coupons) với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng coupons mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.couponsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataCoupons = {
        coupons: data,
        countCoupons: total
      }
      return new ResponseData<any>(dataCoupons, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<CouponEntity>> {
    try {
      return new ResponseData<CouponEntity>(await this.couponsService.findOneCoupon(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CouponEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto): Promise<ResponseData<CouponEntity>> {
    try {
      return new ResponseData<CouponEntity>(await this.couponsService.update(+id, updateCouponDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CouponEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.couponsService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }
}
