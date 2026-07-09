import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { UpdateFavouriteDto } from './dto/update-favourite.dto';
import { ResponseData } from 'src/global/globalClass';
import { FavouriteEntity } from './entities/favourite.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('favourites')   // 👈 nhóm "favourites"
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm tour vào danh sách yêu thích' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 6, description: 'ID user thực hiện thao tác yêu thích' },
        tourId: { type: 'integer', example: 3, description: 'ID tour được thêm vào danh sách yêu thích' },
        // statusFavourite: { type: 'integer', example: 1, description: 'Trạng thái yêu thích (1 = yêu thích, 0 = bỏ thích)', default: 1 },
      },
      required: ['userId', 'tourId'],
    },
  })
  async create(@Req() req, @Body() createFavouriteDto: CreateFavouriteDto): Promise<ResponseData<FavouriteEntity>> {
    try {
      return new ResponseData<FavouriteEntity>(await this.favouritesService.create(createFavouriteDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FavouriteEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<FavouriteEntity[]>> {
    try {
      return new ResponseData<FavouriteEntity[]>(await this.favouritesService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FavouriteEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /favourites/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách favourites có phân trang',
    description: '/favourites/GetAllPagination?page=1&limit=10 (API trả về danh sách các mục yêu thích (favourites) với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng favourites mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.favouritesService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataFavourites = {
        favourites: data,
        countFavourites: total
      }
      return new ResponseData<any>(dataFavourites, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /favourites/findFavoriteByUserId?page=2&limit=10&userId=1
  // @Get('findFavoriteByUserId')
  // async findAllByUserId(@Query() params): Promise<ResponseData<any>> {
  //   try {
  //     const userId = parseInt(params.userId) || 1;
  //     const page = parseInt(params.page) || 1;
  //     const limit = parseInt(params.limit) || 10;

  //     console.log({ userId, page, limit });
  //     const [dataFavourites, total] = await this.favouritesService.findAllByUserId(page, limit, userId);
  //     // const data = [page, limit, search];
  //     const data = {
  //       favourites: dataFavourites,
  //       countFavourites: total
  //     }
  //     // console.log(data);
  //     // console.log(total);
  //     return new ResponseData<any>(data, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
  //   } catch (error) {
  //     return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
  //   }
  // }

  // GET /favourites/FilterPagination?page=1&limit=10&userId=&tourId=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách favourites',
    description: '/favourites/FilterPagination?page=1&limit=10&userId=&tourId= (API cho phép lọc danh sách favourites theo ID người dùng và ID tour, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng favourites mỗi trang' })
  @ApiQuery({ name: 'userId', required: false, type: Number, example: 3, description: 'ID người dùng (lọc theo người dùng)' })
  @ApiQuery({ name: 'tourId', required: false, type: Number, example: 7, description: 'ID tour (lọc theo tour)' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;

      const userId = params.userId || ''; // Từ khóa tìm kiếm theo ID người dùng
      const tourId = params.tourId || ''; // Từ khóa tìm kiếm theo ID tour
      console.log({ page, limit, userId, tourId });

      const [data, total] = await this.favouritesService.filterPagination(page, limit, userId, tourId)
      // const data = [page, limit, search];
      const dataFavourites = {
        favourites: data,
        countFavourites: total
      }
      return new ResponseData<any>(dataFavourites, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<FavouriteEntity | null>> {
    try {
      return new ResponseData<FavouriteEntity | null>(await this.favouritesService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FavouriteEntity | null>(null, error.message, HttpStatus.ERROR);
    }
  }


  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateFavouriteDto: UpdateFavouriteDto): Promise<ResponseData<FavouriteEntity | null>> {
    try {
      return new ResponseData<FavouriteEntity | null>(await this.favouritesService.update(+id, updateFavouriteDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FavouriteEntity | null>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.favouritesService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
