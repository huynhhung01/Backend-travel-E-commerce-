import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionEntity } from './entities/promotion.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';


@ApiTags('promotions')   // 👈 nhóm "promotions"
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo khuyến mãi mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Giảm giá mùa hè cho tất cả các tour', description: 'Mô tả chương trình khuyến mãi' },
        discount: { type: 'integer', minimum: 0, maximum: 100, example: 20, description: 'Phần trăm giảm giá (0 - 100)' },
        startDate: { type: 'date', format: 'date-time', example: '2025-10-01', description: 'Ngày bắt đầu khuyến mãi' },
        endDate: { type: 'date', format: 'date-time', example: '2025-12-31', description: 'Ngày kết thúc khuyến mãi' },
        status: { type: 'string', enum: ['y', 'n'], example: 'y', description: 'Trạng thái khuyến mãi (y = còn hiệu lực, n = không hiệu lực)' },
      },
      required: ['description', 'discount', 'startDate', 'endDate'],
    },
  })
  async create(@Req() req, @Body() createPromotionDto: CreatePromotionDto): Promise<ResponseData<PromotionEntity>> {
    try {
      return new ResponseData<PromotionEntity>(await this.promotionsService.create(createPromotionDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<PromotionEntity>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<PromotionEntity[]>> {
    try {
      return new ResponseData<PromotionEntity[]>(await this.promotionsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<PromotionEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /promotions/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách promotions có phân trang',
    description: '/promotions/GetAllPagination?page=1&limit=10 (API trả về danh sách các chương trình khuyến mãi (promotions) với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng promotions mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.promotionsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataPromotions = {
        promotions: data,
        countPromotions: total
      }
      return new ResponseData<any>(dataPromotions, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<PromotionEntity>> {
    try {
      return new ResponseData<PromotionEntity>(await this.promotionsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<PromotionEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto): Promise<ResponseData<PromotionEntity>> {
    try {
      return new ResponseData<PromotionEntity>(await this.promotionsService.update(+id, updatePromotionDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<PromotionEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.promotionsService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
