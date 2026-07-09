import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HashtagEntity } from './entities/hashtag.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@ApiTags('hashtags')
@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo hashtag mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '#dulich', description: 'Tên hashtag' },
        description: { type: 'string', example: 'du lịch', description: 'Mô tả nội dung Hashtag' },
      },
      required: ['name'],
    },
  })
  async create(@Req() req, @Body() createHashtagDto: CreateHashtagDto): Promise<ResponseData<HashtagEntity>> {
    try {
      return new ResponseData<HashtagEntity>(await this.hashtagsService.create(createHashtagDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post('createListHashtags')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo danh sách hashtag mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: '#dulich', description: 'Tên hashtag (bắt đầu bằng #)', },
          description: { type: 'string', example: 'Du lịch khám phá Việt Nam', description: 'Mô tả nội dung Hashtag', },
        },
        required: ['name'],
      },
    },
  })
  async createListHashtags(@Req() req): Promise<ResponseData<HashtagEntity[]>> {
    try {
      const createListHashtags = req.body;
      return new ResponseData<HashtagEntity[]>(await this.hashtagsService.createListHashtags(createListHashtags), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<HashtagEntity[]>> {
    try {
      return new ResponseData<HashtagEntity[]>(await this.hashtagsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /hashtags/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách hashtags có phân trang',
    description: '/hashtags/GetAllPagination?page=1&limit=10 (API trả về danh sách các hashtag với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng hashtags mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.hashtagsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataHashtags = {
        hashtags: data,
        countHashtags: total
      }
      return new ResponseData<any>(dataHashtags, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  // GET /hashtags/FilterPagination?page=1&limit=10&userId=&tourId=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách hashtags',
    description: '/hashtags/FilterPagination?page=1&limit=10&userId=&tourId= (API cho phép lọc danh sách hashtags theo ID người dùng và ID tour, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng hashtags mỗi trang' })
  @ApiQuery({ name: 'hashtag', required: false, type: String, example: '#dulich', description: 'ID hashtag (lọc theo hashtag)' })

  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;


      const name = params.name || ''; // Từ khóa tìm kiếm theo tên hashtag
      console.log({ page, limit, name });

      const [data, total] = await this.hashtagsService.filterPagination(page, limit, name)
      // const data = [page, limit, search];
      const dataHashtags = {
        hashtags: data,
        countHashtags: total
      }
      return new ResponseData<any>(dataHashtags, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<HashtagEntity>> {
    try {
      return new ResponseData<HashtagEntity>(await this.hashtagsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateHashtagDto: UpdateHashtagDto): Promise<ResponseData<HashtagEntity>> {
    try {
      return new ResponseData<HashtagEntity>(await this.hashtagsService.update(+id, updateHashtagDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<HashtagEntity>> {
    try {
      await this.hashtagsService.remove(+id);
      return new ResponseData<HashtagEntity>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<HashtagEntity>(null, error.message, HttpStatus.ERROR);
    }
  }
}
