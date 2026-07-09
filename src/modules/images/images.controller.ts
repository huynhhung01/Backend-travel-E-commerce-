import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ResponseData } from 'src/global/globalClass';
import { ImageEntity } from './entities/image.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('images')   // 👈 nhóm "images"
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post('createImage')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload ảnh cho tour' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 3, description: 'ID tour liên kết với ảnh' },
        // imageURL: { type: 'string', example: 'https://example.com/images/tour1.jpg', description: 'Đường dẫn ảnh (nếu không upload file)', nullable: true },
        description: { type: 'string', example: 'Hình chụp toàn cảnh đà lạt', description: 'Mô tả cho ảnh (tùy chọn)', nullable: true },
        file: { type: 'string', format: 'binary', description: 'Ảnh upload trực tiếp' },
      },
      required: ['tourId', 'file'],
    },
  })
  async create(@Body() createImageDto: CreateImageDto, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<ImageEntity>> {
    try {
      return new ResponseData<ImageEntity>(await this.imagesService.create(createImageDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      console.log(error);
      return new ResponseData<ImageEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post("createMutipleImage")
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload ảnh cho tour' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 3, description: 'ID tour liên kết với ảnh' },
        // imageURL: { type: 'string', example: 'https://example.com/images/tour1.jpg', description: 'Đường dẫn ảnh (nếu không upload file)', nullable: true },
        description: { type: 'string', example: 'Hình chụp toàn cảnh đà lạt', description: 'Mô tả cho ảnh (tùy chọn)', nullable: true },
        files: { type: 'array', items: { type: 'string', format: 'binary', description: 'Ảnh upload trực tiếp' } },
      },
      required: ['tourId', 'files'],
    },
  })
  async createMutipleImage(@Body() createImageDto: CreateImageDto, @UploadedFiles() files: Express.Multer.File[]): Promise<ResponseData<ImageEntity[]>> {
    try {
      return new ResponseData<ImageEntity[]>(await this.imagesService.createMutipleImage(createImageDto, files), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ImageEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<ImageEntity[]>> {
    try {
      return new ResponseData<ImageEntity[]>(await this.imagesService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ImageEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<ImageEntity>> {
    try {
      return new ResponseData<ImageEntity>(await this.imagesService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ImageEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('/TourId/:id')
  async findImagesByTourId(@Param('id') id: string): Promise<ResponseData<ImageEntity[]>> {
    try {
      return new ResponseData<ImageEntity[]>(await this.imagesService.findImagesByTourId(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ImageEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto): Promise<ResponseData<ImageEntity>> {
    try {
      return new ResponseData<ImageEntity>(await this.imagesService.update(+id, updateImageDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<ImageEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.imagesService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
