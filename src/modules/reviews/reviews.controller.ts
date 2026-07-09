import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity } from './entities/review.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('reviews')   // 👈 nhóm "reviews"
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo đánh giá cho tour' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 3, description: 'ID tour được đánh giá' },
        userId: { type: 'integer', example: 6, description: 'ID user thực hiện đánh giá' },
        rating: { type: 'integer', minimum: 1, maximum: 5, example: 4, description: 'Số sao đánh giá (1 - 5)' },
        comment: { type: 'string', example: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình', description: 'Nội dung đánh giá (không bắt buộc)' },
      },
      required: ['tourId', 'userId', 'rating'],
    },
  })
  async create(@Req() req, @Body() createReviewDto: CreateReviewDto): Promise<ResponseData<ReviewEntity>> {
    try {
      return new ResponseData<ReviewEntity>(await this.reviewsService.create(req.user.userId, createReviewDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ReviewEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<ReviewEntity[]>> {
    try {
      return new ResponseData<ReviewEntity[]>(await this.reviewsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ReviewEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /reviews/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách reviews có phân trang',
    description: '/reviews/GetAllPagination?page=1&limit=10 (API trả về danh sách đánh giá (reviews) với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng review mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.reviewsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataReviews = {
        reviews: data,
        countReviews: total
      }
      return new ResponseData<any>(dataReviews, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /reviews/FilterPagination?page=1&limit=10&userId=&tourId=&rating=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách reviews có phân trang',
    description: '/reviews/FilterPagination?page=1&limit=10&userId=&tourId=&rating= (API trả về danh sách đánh giá (reviews) được lọc theo userId, tourId hoặc rating, có hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng review mỗi trang' })
  @ApiQuery({ name: 'userId', required: false, type: String, example: '5', description: 'ID người dùng cần lọc' })
  @ApiQuery({ name: 'tourId', required: false, type: String, example: '12', description: 'ID tour cần lọc' })
  @ApiQuery({ name: 'rating', required: false, type: Number, example: 5, description: 'Điểm đánh giá (số sao)' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;

      const userId = params.userId || ''; // Từ khóa tìm kiếm theo ID người dùng
      const tourId = params.tourId || ''; // Từ khóa tìm kiếm theo ID tour
      const rating = params.rating || ''; // Từ khóa tìm kiếm theo số sao đánh giá
      console.log({ page, limit, userId, tourId, rating });

      const [data, total] = await this.reviewsService.filterPagination(page, limit, userId, tourId, rating)
      // const data = [page, limit, search];
      const dataReviews = {
        reviews: data,
        countReviews: total
      }
      return new ResponseData<any>(dataReviews, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<ReviewEntity>> {
    try {
      return new ResponseData<ReviewEntity>(await this.reviewsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ReviewEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto): Promise<ResponseData<ReviewEntity>> {
    try {
      return new ResponseData<ReviewEntity>(await this.reviewsService.update(+id, updateReviewDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ReviewEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.reviewsService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
