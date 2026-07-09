import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { CreateFcmDto } from './dto/create-fcm.dto';
import { UpdateFcmDto } from './dto/update-fcm.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseData } from 'src/global/globalClass';
import { FcmEntity } from './entities/fcm.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('fcm')
@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) { }

  @Post()
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo fcm mới' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 6, description: 'ID người tạo fcm' },
        fcmToken: { type: 'string', example: 'fcm_token_example', description: 'FCM token của người dùng' },
        oldFcmToken: { type: 'string', example: 'old_fcm_token_example', description: 'Old FCM token của người dùng' },
      },
      required: ['userId', 'fcmToken',]
    }
  })
  async create(@Req() req, @Body() createFcmDto: CreateFcmDto): Promise<ResponseData<FcmEntity>> {
    try {
      return new ResponseData<FcmEntity>(await this.fcmService.create(createFcmDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FcmEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<FcmEntity[]>> {
    try {
      return new ResponseData<FcmEntity[]>(await this.fcmService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FcmEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<FcmEntity>> {
    try {
      return new ResponseData<FcmEntity>(await this.fcmService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FcmEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFcmDto: UpdateFcmDto): Promise<ResponseData<FcmEntity>> {
    try {
      return new ResponseData<FcmEntity>(await this.fcmService.update(+id, updateFcmDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<FcmEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.fcmService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
