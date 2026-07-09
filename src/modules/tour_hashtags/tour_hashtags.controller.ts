import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TourHashtagsService } from './tour_hashtags.service';
import { CreateTourHashtagDto } from './dto/create-tour_hashtag.dto';
import { UpdateTourHashtagDto } from './dto/update-tour_hashtag.dto';
import { ResponseData } from 'src/global/globalClass';
import { TourHashtagEntity } from './entities/tour_hashtag.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tour-hashtags')   // 👈 nhóm "tour-hashtags"
@Controller('tour-hashtags')
export class TourHashtagsController {
  constructor(private readonly tourHashtagsService: TourHashtagsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo Tour Hashtag (gán Hashtag cho Tour)' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 2, description: 'ID của Tour' },
        hashtagId: { type: 'integer', example: 5, description: 'ID của Hashtag' },
      },
      required: ['tourId', 'hashtagId'],
    },
  })
  async create(@Req() req, @Body() createTourHashtagDto: CreateTourHashtagDto): Promise<ResponseData<TourHashtagEntity>> {
    try {
      return new ResponseData<TourHashtagEntity>(await this.tourHashtagsService.create(createTourHashtagDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourHashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post('createListHashtags')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo danh sách Tour Hashtag (gán Hashtag cho Tour)' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 2, description: 'ID của Tour' },
        hashtags: {
          type: 'array',
          description: 'Danh sách hashtag cần tạo',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: '#dulich', description: 'Tên hashtag' },
              description: { type: 'string', example: 'Du lịch và khám phá', description: 'Mô tả nội dung Hashtag' },
            },
            required: ['name'],
          },
        },
      },
      required: ['tourId', 'hashtags'],
    },
  })
  async createListHashtags(@Req() req): Promise<ResponseData<TourHashtagEntity[]>> {
    try {
      const createListHashtags = req.body.hashtags;
      const tourId = req.body.tourId;
      // console.log(createListHashtags, tourId);
      return new ResponseData<TourHashtagEntity[]>(await this.tourHashtagsService.createListTourHashtags(tourId, createListHashtags), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourHashtagEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<TourHashtagEntity[]>> {
    try {
      return new ResponseData<TourHashtagEntity[]>(await this.tourHashtagsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourHashtagEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  // GET /tours/FilterPagination?page=1&limit=10&userId=1&slug=đà lạt&destination=Đà Lạt&domain=mt&time=3 ngày 2 đêm&status=active
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách tour theo hashtag có phân trang',
    description: '/tour-hashtags/FilterPagination?page=1&limit=10&hashtag=&tourId= (Lọc danh sách tours theo hashtag và tourId).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng tour mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'hashtag', required: false, type: String, example: '#dalat', description: 'Hashtag (ví dụ: #dalat)' })
  @ApiQuery({ name: 'tourId', required: false, type: Number, example: 1, description: 'ID  tour' })

  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const tourId = parseInt(params.tourId);
      const hashtag = params.hashtag || '';
      console.log(page, limit, tourId, hashtag);
      const [data, total] = await this.tourHashtagsService.FilterPagination(page, limit, hashtag, tourId);
      // const data = [page, limit, search];
      const dataTourHashtag = {
        tourHashtags: data,
        countTourHashtag: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(dataTourHashtag, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<TourHashtagEntity>> {
    try {
      return new ResponseData<TourHashtagEntity>(await this.tourHashtagsService.findOneTourHashtag(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourHashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateTourHashtagDto: UpdateTourHashtagDto): Promise<ResponseData<TourHashtagEntity>> {
    try {
      return new ResponseData<TourHashtagEntity>(await this.tourHashtagsService.update(+id, updateTourHashtagDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourHashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }



  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      return new ResponseData<void>(await this.tourHashtagsService.remove(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
