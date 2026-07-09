import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TimelinesService } from './timelines.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { UpdateTimelineDto } from './dto/update-timeline.dto';
import { TimelineEntity } from './entities/timeline.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('timelines')   // 👈 nhóm "timelines"
@Controller('timelines')
export class TimelinesController {
  constructor(private readonly timelinesService: TimelinesService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo Tour timeline ' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 1, description: 'ID tour liên kết' },
        tl_title: { type: 'string', example: 'Ngày 1 - Khởi hành', description: 'Tiêu đề timeline' },
        tl_placeName: { type: 'string', example: 'Đà Lạt', description: 'Tên địa điểm' },
        tl_description: { type: 'string', example: 'Buổi sáng: Khởi hành từ TP.HCM đến Đà Lạt...', description: 'Mô tả chi tiết hoạt động trong ngày' },
        file: {
          type: 'string',
          format: 'binary', // 🔥 cái này bắt buộc để Swagger render nút "Choose File"
          description: 'Ảnh đại diện upload',
        },
      },
      required: ['tourId', 'tl_title', 'tl_description'],
    },
  })
  async create(@Req() req, @Body() createTimelineDto: CreateTimelineDto, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<TimelineEntity>> {
    try {
      return new ResponseData<TimelineEntity>(await this.timelinesService.create(createTimelineDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TimelineEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<TimelineEntity[]>> {
    try {
      return new ResponseData<TimelineEntity[]>(await this.timelinesService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TimelineEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /timelines/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách timelines có phân trang',
    description: '/timelines/GetAllPagination?page=1&limit=10  (API trả về danh sách timeline của các tour, có hỗ trợ phân trang theo page và limit).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng timeline mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.timelinesService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataTimelines = {
        timelines: data,
        countTimelines: total
      }
      return new ResponseData<any>(dataTimelines, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /timelines/FilterPagination?page=1&limit=10&tourId=1
  // GET /timelines/FilterPagination?page=1&limit=10&tourId=1
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách timelines theo tourId có phân trang',
    description: '/timelines/FilterPagination?page=1&limit=10&tourId=1  (API trả về danh sách timeline được lọc theo tourId, có hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng timeline mỗi trang' })
  @ApiQuery({ name: 'tourId', required: false, type: Number, example: 1, description: 'ID tour cần lọc (nếu không có sẽ mặc định 1)' })
  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const tourId = parseInt(params.tourId) || 1;
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;

      console.log({ tourId, page, limit });
      const [dataTimelines, total] = await this.timelinesService.filterPagination(page, limit, tourId);
      // const data = [page, limit, search];
      const data = {
        timelines: dataTimelines,
        countTimelines: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(data, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<TimelineEntity>> {
    try {
      return new ResponseData<TimelineEntity>(await this.timelinesService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TimelineEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  // get timeline by tour id

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateTimelineDto: UpdateTimelineDto): Promise<ResponseData<TimelineEntity>> {
    try {
      return new ResponseData<TimelineEntity>(await this.timelinesService.update(+id, updateTimelineDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TimelineEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post('updateImageTimeline')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật hình ảnh timeline' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeLineId: { type: 'integer', example: 1, description: 'ID timeline cần cập nhật' },
        file: {
          type: 'string',
          format: 'binary', // 🔥 cái này bắt buộc để Swagger render nút "Choose File"
          description: 'Ảnh đại diện upload',
        },
      },
      required: ['timeLineId', 'file'],
    },
  })
  async updateImage(@Req() req, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<TimelineEntity>> {
    try {
      // console.log(timeLineId);
      const timeLineId = Number(req.body.timeLineId); // ✅ Lấy từ body
      console.log(timeLineId);
      return new ResponseData<TimelineEntity>(await this.timelinesService.updateImage(timeLineId, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TimelineEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.timelinesService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}

