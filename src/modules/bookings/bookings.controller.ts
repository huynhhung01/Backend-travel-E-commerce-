import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingEntity } from './entities/booking.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentBookingDto } from './dto/paymentBooking.dto';
import { CancelBookingDto } from './dto/cancelBooking.dto';

@ApiTags('bookings')   // 👈 nhóm "bookings"
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tourId: { type: 'integer', example: 3, description: 'ID tour được đặt' },
        userId: { type: 'integer', example: 6, description: 'ID người dùng đặt tour' },
        dateId: { type: 'integer', example: 3, description: 'ID ngày khởi hành (Start_End_Date)' },
        fullName: { type: 'string', example: 'Nguyễn Văn A', description: 'Họ và tên người đặt' },
        email: { type: 'string', example: 'example@gmail.com', description: 'Email người đặt' },
        phoneNumber: { type: 'string', example: '0987654321', description: 'Số điện thoại liên hệ' },
        address: { type: 'string', example: '123 Đường ABC, Quận 1', description: 'Địa chỉ liên hệ', nullable: true },
        numAdults: { type: 'integer', example: 2, minimum: 1, description: 'Số lượng người lớn' },
        numChildren: { type: 'integer', example: 1, minimum: 0, description: 'Số lượng trẻ em', nullable: true },
        codeCoupon: { type: 'string', example: 'SUMMER2025', description: 'Mã coupon áp dụng' },
        // totalPrice: { type: 'integer', example: 3000000, description: 'Tổng giá trị booking' },
        bookingStatus: { type: 'string', enum: ['pending', 'confirmed', 'canceled', 'paid'], example: 'pending', description: 'Trạng thái booking' },
        receiveEmail: { type: 'boolean', example: true, description: 'Có nhận email xác nhận không', nullable: true },
      },
      required: ['tourId', 'userId', 'dateId', 'fullName', 'email', 'phoneNumber', 'numAdults', 'totalPrice']
    }
  })
  async create(@Req() req, @Body() createBookingDto: CreateBookingDto): Promise<ResponseData<BookingEntity>> {
    try {
      return new ResponseData<BookingEntity>(await this.bookingsService.create(createBookingDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<BookingEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<BookingEntity[]>> {
    try {
      return new ResponseData<BookingEntity[]>(await this.bookingsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<BookingEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /bookings/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách bookings có phân trang',
    description: '/bookings/GetAllPagination?page=1&limit=10 (API này trả về danh sách tất cả bookings có hỗ trợ phân trang (page, limit)).',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng bookings trên mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.bookingsService.findAllPagination(page, limit)
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

  @Get('GetAllPaginationStart_end_dte')
  @ApiOperation({
    summary: 'Lấy danh sách bookings có phân trang',
    description: '/bookings/GetAllPagination?page=1&limit=10 (API này trả về danh sách tất cả bookings có hỗ trợ phân trang (page, limit)).',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng bookings trên mỗi trang' })
  @ApiQuery({ name: 'bookingStatus', required: false, type: String, example: 'confirmed', description: 'Trạng thái booking (pending, confirmed, canceled...)' })
  @ApiQuery({ name: 'dateId', required: false, type: Number, example: 1, description: 'ID start_end_date (tìm kiếm theo start_end_date)' })
  async findAllPagination_Start_end_date(@Query() params: any): Promise<ResponseData<any>> {
    try {

      const dateId = params.dateId; // ID start_end_date (tìm kiếm theo start_end_date  )
      const bookingStatus = params.bookingStatus || ''; // Trạng thái booking
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const [data, total] = await this.bookingsService.findAllPagination_Start_end_date(page, limit, dateId, bookingStatus);
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

  // GET /bookings/FilterPagination?page=1&limit=10&fullName=&email=&phoneNumber=&bookingStatus=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách bookings',
    description: '/bookings/FilterPagination?page=1&limit=10&userId=&&fullName=&email=&phoneNumber=&bookingStatus= (API trả về danh sách bookings có thể lọc theo họ tên, email, số điện thoại và trạng thái, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng bookings mỗi trang' })
  @ApiQuery({ name: 'userId', required: false, type: Number, example: 1, description: 'ID người dùng (tìm kiếm theo người dùng)' })
  @ApiQuery({ name: 'supplierId', required: false, type: Number, example: 1, description: 'ID nhà cung cấp (tìm kiếm theo nhà cung cấp)' })
  @ApiQuery({ name: 'dateId', required: false, type: Number, example: 1, description: 'ID start_end_date (tìm kiếm theo start_end_date)' })
  @ApiQuery({ name: 'fullName', required: false, type: String, example: 'Nguyen Van A', description: 'Từ khóa tìm kiếm theo họ tên' })
  @ApiQuery({ name: 'email', required: false, type: String, example: 'example@gmail.com', description: 'Từ khóa tìm kiếm theo email' })
  @ApiQuery({ name: 'phoneNumber', required: false, type: String, example: '0987654321', description: 'Từ khóa tìm kiếm theo số điện thoại' })
  @ApiQuery({ name: 'bookingStatus', required: false, type: String, example: 'confirmed', description: 'Trạng thái booking (pending, confirmed, canceled...)' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const userId = params.userId; // ID người dùng (tìm kiếm theo người dùng)
      const supplierId = params.supplierId; // ID nhà cung cấp (tìm kiếm theo nhà cung cấp)
      const dateId = params.dateId; // ID start_end_date (tìm kiếm theo start_end_date  )
      const fullName = params.fullName || ''; // Từ khóa tìm kiếm theo họ tên
      const email = params.email || ''; // Từ khóa tìm kiếm theo email
      const phoneNumber = params.phoneNumber || ''; // Từ khóa tìm kiếm theo số điện thoại
      const bookingStatus = params.bookingStatus || ''; // Trạng thái booking
      console.log({ page, limit, userId, supplierId, dateId, fullName, email, phoneNumber, bookingStatus });

      const [data, total] = await this.bookingsService.filterPagination(page, limit, userId, supplierId, dateId, fullName, email, phoneNumber, bookingStatus)
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
  async findOne(@Param('id') id: string): Promise<ResponseData<BookingEntity>> {
    try {
      return new ResponseData<BookingEntity>(await this.bookingsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<BookingEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  // @Patch(':id')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  // async update(@Req() req, @Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto): Promise<ResponseData<BookingEntity>> {
  //   try {
  //     return new ResponseData<BookingEntity>(await this.bookingsService.update(+id, updateBookingDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
  //   } catch (error) {
  //     return new ResponseData<BookingEntity>(null, error.message, HttpStatus.ERROR);
  //   }
  // }

  @Post('cancelBooking')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Hủy booking với xử lý hàng đợi' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 6, description: 'ID người dùng đặt tour' },
        bookingId: { type: 'integer', example: 3, description: 'ID booking cần hủy' },
      },
      required: ['userId', 'bookingId']
    }
  })
  async queuedCancelBooking(@Req() req, @Body() cancelBookingDto): Promise<ResponseData<any>> {
    try {
      cancelBookingDto.SupplierCancel = false; // phân biệt hủy bởi user hay bởi supplier
      const payload = await this.bookingsService.queuedCancelBooking(cancelBookingDto);
      console.log('payload:', payload);
      return new ResponseData<any>(payload, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }


  @Post('SupplierCancelBookingByIdBooking/:id')
  @ApiOperation({
    summary: 'Nhà cung cấp hủy booking theo ID booking ',
    description: 'API cho phép nhà cung cấp hủy booking theo ID booking.'
  })
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  async SupplierCancelBookingUser(@Req() req, @Param('id') id: string): Promise<ResponseData<any>> {
    try {
      // id Start_End_Date
      return new ResponseData<any>(await this.bookingsService.SupplierCancelBookingUser(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }


  @Post('SupplierCancelBooking/:id')
  @ApiOperation({
    summary: 'Nhà cung cấp hủy booking theo ID ngày khởi hành (Start_End_Date)',
    description: 'API cho phép nhà cung cấp hủy booking theo ID ngày khởi hành (Start_End_Date).'
  })
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  async SupplierCancelBookingStartEndDate(@Req() req, @Param('id') id: string): Promise<ResponseData<any>> {
    try {
      // id Start_End_Date
      return new ResponseData<any>(await this.bookingsService.SupplierCancelBooking(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('cancel-status/:jobId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái job hủy booking' })
  async getCancelJobStatus(@Param('jobId') jobId: string): Promise<ResponseData<any>> {
    try {
      const status = await this.bookingsService.getCancelJobStatus(jobId);
      return new ResponseData<any>(status, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @Get('getPriceBookingCancel/:id')
  async getPriceBookingCancel(@Param('id') id: string): Promise<ResponseData<any>> {
    try {
      console.log('id:', id);
      return new ResponseData<any>(await this.bookingsService.getPriceBookingCancel(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Post('payCoinBooking')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 6, description: 'ID người dùng đặt tour' },
        bookingId: { type: 'integer', example: 3, description: 'ID ngày khởi hành (Start_End_Date)' },
        amount: { type: 'bigint', example: 3000000, description: 'Tổng giá trị booking' },
      },
      required: ['userId', 'bookingId', 'amount']
    }
  })
  async payCoinBooking(@Req() req, @Body() paymentBookingDto: PaymentBookingDto): Promise<ResponseData<any>> {
    try {
      const payload = await this.bookingsService.payCoinBooking(paymentBookingDto);
      console.log('payload:', payload);
      return new ResponseData<any>(payload, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('payment-status/:jobId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái job thanh toán' })
  async getPaymentJobStatus(@Param('jobId') jobId: string): Promise<ResponseData<any>> {
    try {
      const status = await this.bookingsService.getPaymentJobStatus(jobId);
      return new ResponseData<any>(status, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('booking-status/:bookingId')
  @ApiOperation({ summary: 'Lấy trạng thái booking hiện tại' })
  async getBookingStatus(@Param('bookingId') bookingId: string): Promise<ResponseData<any>> {
    try {
      const booking = await this.bookingsService.findOne(+bookingId);
      return new ResponseData<any>({ bookingId: booking.bookingId, status: booking.bookingStatus }, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.bookingsService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
