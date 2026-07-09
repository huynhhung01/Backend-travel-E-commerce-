import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourEntity } from './entities/tour.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderByType } from './dto/order-by.enum';

@ApiTags('tours')   // 👈 nhóm "tours"
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Swap GER (có thể gửi JSON hoặc form-data)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Tour Đà Lạt 3 ngày 2 đêm' },
        description: { type: 'string', example: 'Tham quan Langbiang, Hồ Xuân Hương...' },
        file: { type: 'string', format: 'binary', description: 'Ảnh đại diện tour', },
        destination: { type: 'string', example: 'Đà Lạt' },
        highlight: { type: 'string', example: 'Ngày 1: ... Ngày 2: ...' },
        time: { type: 'string', example: '3 ngày 2 đêm' },
        reviews: { type: 'string', example: 'Rất đáng trải nghiệm' },
        domain: { type: 'string', example: 'mt' },
        quantity: { type: 'integer', example: 20 },
        countComplete: { type: 'integer', example: 5 },
        address: { type: 'string', example: '01 Trần Hưng Đạo, Đà Lạt' },
        userId: { type: 'integer', example: 4 }, // ID user (supplier) tạo tour
      },
      required: ['title', 'quantity', 'userId'], // ✅ các field bắt buộc
    },
  })
  async create(@Req() req, @Body() createTourDto: CreateTourDto, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<TourEntity>> {
    try {
      return new ResponseData<TourEntity>(await this.toursService.create(createTourDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post("createTour")
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Swap GER (có thể gửi JSON hoặc form-data)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Tour Đà Lạt 3 ngày 2 đêm' },
        description: { type: 'string', example: 'Tham quan Langbiang, Hồ Xuân Hương...' },
        file: {
          type: 'string',
          format: 'binary', // 🔥 để upload file
          description: 'Ảnh đại diện tour',
        },
        destination: { type: 'string', example: 'Đà Lạt' },
        itinerary: { type: 'string', example: 'Ngày 1: ... Ngày 2: ...' },
        time: { type: 'string', example: '3 ngày 2 đêm' },
        reviews: { type: 'string', example: 'Rất đáng trải nghiệm' },
        domain: { type: 'string', example: 'mt' },
        quantity: { type: 'integer', example: 20 },
        countComplete: { type: 'integer', example: 5 },
        address: { type: 'string', example: '01 Trần Hưng Đạo, Đà Lạt' },
        userId: { type: 'integer', example: 4 }, // ID user (supplier) tạo tour
      },
      required: ['title', 'quantity', 'userId'], // ✅ các field bắt buộc
    },
  })
  async createTour(@Req() req, @Body() createTourDto: CreateTourDto, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<TourEntity>> {
    try {
      return new ResponseData<TourEntity>(await this.toursService.create(createTourDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<TourEntity[]>> {
    try {

      return new ResponseData<TourEntity[]>(await this.toursService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  // GET /tours/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách tours có phân trang',
    description: '/tours/GetAllPagination?page=1&limit=10  (Trả về danh sách các tour với dữ liệu được phân trang theo page và limit).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng tour mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.toursService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataTours = {
        tours: data,
        countTours: total
      }
      return new ResponseData<any>(dataTours, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /tours/FilterPagination?page=1&limit=10&userId=1&slug=đà lạt&destination=Đà Lạt&domain=mt&time=3 ngày 2 đêm&status=active
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách tours có phân trang',
    description: '/tours/FilterPagination?page=1&limit=10&userId=1&slug=đà lạt&destination=Đà Lạt&domain=mt&time=3 ngày 2 đêm&status=active   (Lọc danh sách tours theo userId, slug, điểm đến, miền, thời gian và trạng thái).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng tour mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'userId', required: false, type: Number, example: 1, description: 'ID người tạo tour' })
  @ApiQuery({ name: 'slug', required: false, type: String, example: 'da-lat', description: 'Slug tour (ví dụ: da-lat)' })
  @ApiQuery({ name: 'destination', required: false, type: String, example: 'Đà Lạt', description: 'Điểm đến của tour' })
  @ApiQuery({ name: 'domain', required: false, type: String, example: 'mt', description: 'Miền (ví dụ: bắc, trung, nam)' })
  @ApiQuery({ name: 'time', required: false, type: String, example: '3 ngày 2 đêm', description: 'Thời gian tour' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active', description: 'Trạng thái tour (active | inactive | pending)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: OrderByType, example: OrderByType.NEWEST, description: 'Kiểu sắp xếp tour (newest | rating | booking)' })
  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const userId = parseInt(params.userId);
      const slug = params.slug || '';
      const destination = params.destination || '';
      const domain = params.domain || '';
      const time = params.time || '';
      const orderBy = params.orderBy || '';
      // const search = params.search || ''; // Từ khóa tìm kiếm
      const status = params.status || ''; // trạng thái 'active' | 'inactive' | 'pending'

      console.log({ page, limit, userId, slug, destination, domain, time, status });
      const [data, total] = await this.toursService.FilterPagination(page, limit, userId, slug, destination, domain, time, status, orderBy);
      // const data = [page, limit, search];
      const dataTour = {
        tours: data,
        countTour: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(dataTour, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<TourEntity>> {
    try {
      return new ResponseData<TourEntity>(await this.toursService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateTourDto: UpdateTourDto): Promise<ResponseData<TourEntity>> {
    try {
      return new ResponseData<TourEntity>(await this.toursService.update(+id, updateTourDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TourEntity>(null, error.message, HttpStatus.ERROR);
    }
  }




  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.toursService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
