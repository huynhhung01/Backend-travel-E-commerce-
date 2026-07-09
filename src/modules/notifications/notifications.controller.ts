import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ResponseData } from 'src/global/globalClass';
import { NotificationEntity } from './entities/notification.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'tạo mới notification với type là : THANH_TOAN,NAP_TIEN,RUT_TIEN,HOAN_TIEN,KHUYEN_MAI ' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userFromId: { type: 'integer', example: 6, description: 'ID user gửi thông báo' },
        userToId: { type: 'integer', example: 3, description: 'ID user nhận thông báo' },
        title: { type: 'string', example: 'Thông báo mới', description: 'Tiêu đề thông báo' },
        body: { type: 'string', example: 'Bạn có một thông báo mới', description: 'Nội dung thông báo' },
        additionalData: { type: 'string', example: { key: "value" }, description: 'Dữ liệu bổ sung dưới dạng JSON (không bắt buộc)' },
        type: { type: 'string', example: 'NHAN_TIEN', description: 'Loại thông báo (ví dụ: THANH_TOAN,NAP_TIEN,RUT_TIEN,HOAN_TIEN,KHUYEN_MAI)' },

        // statusFavourite: { type: 'integer', example: 1, description: 'Trạng thái yêu thích (1 = yêu thích, 0 = bỏ thích)', default: 1 },
      },
      required: ['userFromId', 'userToId', 'title', 'body', 'type'],
    },
  })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<ResponseData<NotificationEntity>> {
    try {
      return new ResponseData<NotificationEntity>(await this.notificationsService.create(createNotificationDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<NotificationEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<NotificationEntity[]>> {
    try {
      return new ResponseData<NotificationEntity[]>(await this.notificationsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<NotificationEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  // GET /notifications/FilterPagination?page=1&limit=10&userId=&tourId=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách notifications',
    description: '/notifications/FilterPagination?page=1&limit=10&userFromId=&userToId=&isSeen=&type=&title=&body=&additionalData= (API cho phép lọc danh sách notifications theo ID người gởi và ID người nhận, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng notifications mỗi trang' })
  @ApiQuery({ name: 'userFromId', required: false, type: Number, example: 3, description: 'ID người gởi tin nhắn' })
  @ApiQuery({ name: 'userToId', required: false, type: Number, example: 6, description: 'ID người nhận tin nhắn' })
  @ApiQuery({ name: 'isSeen', required: false, type: Boolean, example: true, description: 'Trạng thái đã xem (true = đã xem, false = chưa xem)' })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'THANH_TOAN', description: 'Loại thông báo (ví dụ: THANH_TOAN,NAP_TIEN,RUT_TIEN,HOAN_TIEN,KHUYEN_MAI)' })

  @ApiQuery({ name: 'title', required: false, type: String, example: 'Thông báo mới', description: 'Tiêu đề thông báo' })
  @ApiQuery({ name: 'body', required: false, type: String, example: 'Bạn có một thông báo mới', description: 'Nội dung thông báo' })
  @ApiQuery({ name: 'additionalData', required: false, type: Object, example: { key: 'value' }, description: 'Dữ liệu bổ sung' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;

      const userFromId = params.userFromId || '';
      const userToId = params.userToId || '';
      const isSeen = params.isSeen || '';
      const type = params.type || null;
      const title = params.title || null;
      const body = params.body || null;
      const additionalData = params.additionalData || null;

      console.log({ page, limit, userFromId, userToId, isSeen, type, title, body, additionalData });

      const [data, total] = await this.notificationsService.filterPagination(page, limit, userFromId, userToId, isSeen, type, title, body, additionalData);
      // const data = [page, limit, search];
      const dataNotifications = {
        notifications: data,
        countNotifications: total
      }
      return new ResponseData<any>(dataNotifications, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<NotificationEntity>> {
    try {
      return new ResponseData<NotificationEntity>(await this.notificationsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<NotificationEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto): Promise<ResponseData<NotificationEntity>> {
    try {
      return new ResponseData<NotificationEntity>(await this.notificationsService.update(+id, updateNotificationDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<NotificationEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      return new ResponseData<void>(await this.notificationsService.remove(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
