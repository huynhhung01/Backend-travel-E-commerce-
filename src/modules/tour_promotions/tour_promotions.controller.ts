import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TourPromotionsService } from './tour_promotions.service';
import { CreateTourPromotionDto } from './dto/create-tour_promotion.dto';
import { UpdateTourPromotionDto } from './dto/update-tour_promotion.dto';
import { TourPromotionEntity } from './entities/tour_promotion.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('tour-promotions')   // 👈 nhóm "tour-promotions"
@Controller('tour-promotions')
export class TourPromotionsController {
  constructor(private readonly tourPromotionsService: TourPromotionsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo Tour Promotion (gán Promotion + Date cho Tour)' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        promotionId: { type: 'integer', example: 2, description: 'ID của Promotion' },
        dateId: { type: 'integer', example: 5, description: 'ID của StartEndDate' },

      },
      required: ['promotionId', 'dateId'],
    },
  })
  async create(@Req() req, @Body() createTourPromotionDto: CreateTourPromotionDto): Promise<ResponseData<TourPromotionEntity>> {
    try {
      return new ResponseData<TourPromotionEntity>(await this.tourPromotionsService.create(createTourPromotionDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourPromotionEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<TourPromotionEntity[]>> {
    try {
      return new ResponseData<TourPromotionEntity[]>(await this.tourPromotionsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourPromotionEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /tour-promotions/FilterPagination?page=1&limit=10&userId=1&slug=đà lạt&destination=Đà Lạt&domain=mt&time=3 ngày 2 đêm&status=active
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách theo tour, theo discount ( <= discount) có phân trang',
    description: '/tour-promotions/FilterPagination?page=1&limit=10&promotion=&tourId= (Lọc danh sách tours theo promotion và tourId).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng tour mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'discount', required: false, type: Number, example: 15, description: 'Promotion <= discount (ví dụ:discount = 15 lấy ra các discout <= 15)' })
  @ApiQuery({ name: 'tourId', required: false, type: Number, example: 1, description: 'ID  tour' })

  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const tourId = parseInt(params.tourId);
      const discount = parseInt(params.discount);
      console.log(page, limit, tourId, discount);
      const [data, total] = await this.tourPromotionsService.FilterPagination(page, limit, discount, tourId);
      // const data = [page, limit, search];
      const dataTourPromotion = {
        tourPromotions: data,
        countTourPromotion: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(dataTourPromotion, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<TourPromotionEntity | null>> {
    try {
      return new ResponseData<TourPromotionEntity | null>(await this.tourPromotionsService.findOneTourPromotion(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourPromotionEntity | null>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateTourPromotionDto: UpdateTourPromotionDto): Promise<ResponseData<TourPromotionEntity | null>> {
    try {
      return new ResponseData<TourPromotionEntity>(await this.tourPromotionsService.update(+id, updateTourPromotionDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourPromotionEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      return new ResponseData<void>(await this.tourPromotionsService.remove(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
