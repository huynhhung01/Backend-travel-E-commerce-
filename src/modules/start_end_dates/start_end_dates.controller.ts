import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { StartEndDatesService } from './start_end_dates.service';
import { CreateStartEndDateDto } from './dto/create-start_end_date.dto';
import { UpdateStartEndDateDto } from './dto/update-start_end_date.dto';
import { StartEndDateEntity } from './entities/start_end_date.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('start-end-dates')   // 👈 nhóm "start-end-dates"
@Controller('start-end-dates')
export class StartEndDatesController {
  constructor(private readonly startEndDatesService: StartEndDatesService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo Start-End Date cho Tour' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 1, description: 'ID tour liên kết' },
        startDate: { type: 'date', format: 'date-time', example: '2025-10-01', description: 'Ngày bắt đầu tour' },
        endDate: { type: 'date', format: 'date-time', example: '2025-10-05', description: 'Ngày kết thúc tour' },
        priceAdult: { type: 'integer', example: 3000000, description: 'Giá vé cho người lớn' },
        priceChildren: { type: 'integer', example: 1500000, description: 'Giá vé cho trẻ em' },
        quantity: { type: 'integer', example: 30, description: 'Số lượng chỗ khả dụng' },
        availability: { type: 'integer', enum: [0, 1], example: 1, description: 'Trạng thái chỗ (1 = còn chỗ, 0 = hết chỗ)' },
      },
      required: ['tourId', 'startDate', 'endDate', 'priceAdult', 'priceChildren', 'quantity'],
    },
  })
  async create(@Req() req, @Body() createStartEndDateDto: CreateStartEndDateDto): Promise<ResponseData<StartEndDateEntity>> {
    try {
      return new ResponseData<StartEndDateEntity>(await this.startEndDatesService.create(createStartEndDateDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<StartEndDateEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<StartEndDateEntity[]>> {
    try {
      return new ResponseData<StartEndDateEntity[]>(await this.startEndDatesService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<StartEndDateEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  // GET /start-end-dates/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách ngày bắt đầu và kết thúc có phân trang',
    description: ' /start-end-dates/GetAllPagination?page=1&limit=10 (API trả về danh sách Start-End-Dates với hỗ trợ phân trang theo page và limit).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng phần tử mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.startEndDatesService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataStartEndDates = {
        startEndDates: data,
        countStartEndDates: total
      }
      return new ResponseData<any>(dataStartEndDates, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /start-end-dates/FilterPagination?page=1&limit=10=&tourId=&minpriceAdult=&maxpriceAdult=&minpriceChildren=&maxpriceChildren=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách Start-End-Dates có phân trang',
    description: ' /start-end-dates/FilterPagination?page=1&limit=10&tourId=&minpriceAdult=&maxpriceAdult=&minpriceChildren=&maxpriceChildren= (API trả về danh sách ngày bắt đầu - kết thúc được lọc theo tourId và khoảng giá (người lớn, trẻ em), có hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng phần tử mỗi trang' })
  @ApiQuery({ name: 'tourId', required: false, type: String, example: '5', description: 'ID tour cần lọc' })
  @ApiQuery({ name: 'minpriceAdult', required: false, type: Number, example: 1000000, description: 'Giá vé người lớn thấp nhất' })
  @ApiQuery({ name: 'maxpriceAdult', required: false, type: Number, example: 3000000, description: 'Giá vé người lớn cao nhất' })
  @ApiQuery({ name: 'minpriceChildren', required: false, type: Number, example: 500000, description: 'Giá vé trẻ em thấp nhất' })
  @ApiQuery({ name: 'maxpriceChildren', required: false, type: Number, example: 1500000, description: 'Giá vé trẻ em cao nhất' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;


      const tourId = params.tourId || ''; // Từ khóa tìm kiếm theo ID tour
      const minpriceAdult = params.minpriceAdult || ''; // Từ khóa tìm kiếm theo giá vé người lớn thấp nhất
      const maxpriceAdult = params.maxpriceAdult || ''; // Từ khóa tìm kiếm theo giá vé người lớn cao nhất
      const minpriceChildren = params.minpriceChildren || ''; // Từ khóa tìm kiếm theo giá vé trẻ em thấp nhất
      const maxpriceChildren = params.maxpriceChildren || ''; // Từ khóa tìm kiếm theo giá vé trẻ em cao nhất
      console.log({ page, limit, tourId });

      const [data, total] = await this.startEndDatesService.filterPagination(page, limit, tourId, minpriceAdult, maxpriceAdult, minpriceChildren, maxpriceChildren)
      // const data = [page, limit, search];
      const dataStartEndDates = {
        startEndDates: data,
        countStartEndDates: total
      }
      return new ResponseData<any>(dataStartEndDates, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<StartEndDateEntity>> {
    try {
      return new ResponseData<StartEndDateEntity>(await this.startEndDatesService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<StartEndDateEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('priceTour/:TourId')
  async findPricerTour(@Param('TourId') TourId: string): Promise<ResponseData<any>> {
    try {
      return new ResponseData<any>(await this.startEndDatesService.findPriceTour(+TourId), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateStartEndDateDto: UpdateStartEndDateDto): Promise<ResponseData<StartEndDateEntity>> {
    try {
      return new ResponseData<StartEndDateEntity>(await this.startEndDatesService.update(+id, updateStartEndDateDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<StartEndDateEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.startEndDatesService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
