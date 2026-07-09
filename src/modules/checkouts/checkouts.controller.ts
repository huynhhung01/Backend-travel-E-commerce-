import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { CheckoutEntity } from './entities/checkout.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('checkouts')   // 👈 nhóm "checkouts"
@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo thanh toán (Checkout)' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'integer', example: 123, description: 'ID booking liên kết' },
        paymentMethod: { type: 'string', enum: ['CASH', 'VNPAY', 'MOMO', 'BANKING'], example: 'MOMO', description: 'Phương thức thanh toán' },
        // paymentDate: { type: 'string', format: 'date-time', example: '2025-09-25T10:30:00Z', description: 'Ngày thanh toán (ISO)', nullable: true },
        amount: { type: 'integer', example: 1500000, minimum: 0, description: 'Số tiền thanh toán' },
        paymentStatus: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED'], example: 'PENDING', description: 'Trạng thái thanh toán' },
        // transactionId: { type: 'string', example: 'TXN123456789', description: 'Mã giao dịch từ cổng thanh toán', nullable: true },
      },
      required: ['bookingId', 'paymentMethod', 'amount', 'paymentStatus']
    }
  })
  async create(@Body() createCheckoutDto: CreateCheckoutDto): Promise<ResponseData<CheckoutEntity>> {
    try {
      return new ResponseData<CheckoutEntity>(await this.checkoutsService.create(createCheckoutDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CheckoutEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<CheckoutEntity[]>> {
    try {
      return new ResponseData<CheckoutEntity[]>(await this.checkoutsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CheckoutEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /checkouts/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách checkouts có phân trang',
    description: '/checkouts/GetAllPagination?page=1&limit=10 (API trả về danh sách các checkouts với hỗ trợ phân trang (page, limit)).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng checkouts mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.checkoutsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataCheckouts = {
        checkouts: data,
        countCheckouts: total
      }
      return new ResponseData<any>(dataCheckouts, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /checkouts/FilterPagination?page=1&limit=10&paymentMethod=&paymentStatus=&transactionId=&bookingId=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách checkouts',
    description: '/checkouts/FilterPagination?page=1&limit=10&paymentMethod=&paymentStatus=&transactionId=&bookingId= (API cho phép lọc danh sách checkouts theo phương thức thanh toán, trạng thái thanh toán, mã giao dịch và ID booking, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng checkouts mỗi trang' })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, example: 'credit_card', description: 'Phương thức thanh toán (credit_card, paypal, cash...)' })
  @ApiQuery({ name: 'paymentStatus', required: false, type: String, example: 'completed', description: 'Trạng thái thanh toán (pending, completed, failed...)' })
  @ApiQuery({ name: 'transactionId', required: false, type: String, example: 'TXN123456789', description: 'Mã giao dịch thanh toán' })
  @ApiQuery({ name: 'bookingId', required: false, type: Number, example: 5, description: 'ID của booking tương ứng' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const paymentMethod = params.paymentMethod || ''; // Từ khóa tìm kiếm theo phương thức thanh toán
      const paymentStatus = params.paymentStatus || ''; // Từ khóa tìm kiếm theo trạng thái thanh toán
      const transactionId = params.transactionId || ''; // Từ khóa tìm kiếm theo mã giao dịch
      const bookingId = params.bookingId || ''; // Từ khóa tìm kiếm theo ID booking
      console.log({ page, limit, paymentMethod, paymentStatus, transactionId, bookingId });

      const [data, total] = await this.checkoutsService.filterPagination(page, limit, paymentMethod, paymentStatus, transactionId, bookingId)
      // const data = [page, limit, search];
      const dataBookings = {
        bookings: data,
        countBookings: total
      }
      return new ResponseData<any>(dataBookings, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<CheckoutEntity>> {
    try {
      return new ResponseData<CheckoutEntity>(await this.checkoutsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CheckoutEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCheckoutDto: UpdateCheckoutDto): Promise<ResponseData<CheckoutEntity>> {
    try {
      return new ResponseData<CheckoutEntity>(await this.checkoutsService.update(+id, updateCheckoutDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<CheckoutEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      return new ResponseData<void>(await this.checkoutsService.remove(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
