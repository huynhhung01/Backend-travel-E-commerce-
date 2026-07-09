import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Sse, UseGuards, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PaymentDto } from './dto/payment.dto';
import { ResponseData } from 'src/global/globalClass';
import { TransactionEntity } from './entities/transaction.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { map, Observable } from 'rxjs';
import { PaymentCoinDto } from './dto/paymentCoin.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  // @Post()
  // async create(@Req() req, @Body() createPaymentDto: PaymentDto): Promise<ResponseData<TransactionEntity>> {
  //   try {
  //     // console.log('User making payment:', req.user);
  //     return new ResponseData<TransactionEntity>(await this.transactionsService.create(createPaymentDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
  //   } catch (error) {
  //     return new ResponseData<TransactionEntity>(null, error.message, error.status || HttpStatus.ERROR);
  //   }
  // }

  @Post('InOutcoin')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo transaction in out coin mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userWalletAccountId: { type: 'integer', example: 1, description: 'ID tài khoản wallet', },
        amount: { type: 'bigint', example: 500, description: 'Số tiền giao dịch (>= 1)', },
        type: { type: 'string', enum: ['NAP_TIEN', 'RUT_TIEN',], example: 'NAP_TIEN', description: 'Loại giao dịch: Nạp, Rút', },
        // status: {type: 'string',enum: ['PENDING', 'SUCCESS', 'FAILED'],example: 'PENDING',description: 'Trạng thái giao dịch (mặc định là PENDING)',},
        // description: { type: 'string', example: 'thanh toán 500 booking id 123', description: 'Mô tả chi tiết giao dịch thanh toán booking', },
      },
      required: ['userWalletAccountId', 'amount', 'type'],
    },
  })
  async createPayment(@Req() req, @Body() paymentCoinDto: PaymentCoinDto): Promise<ResponseData<TransactionEntity>> {
    try {
      // console.log('User making payment:', req.user);
      return new ResponseData<TransactionEntity>(await this.transactionsService.createPaymentCoin(paymentCoinDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TransactionEntity>(null, error.message, error.status || HttpStatus.ERROR);
    }
  }

  @Post('RutTien')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo transaction rut tien mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userWalletAccountId: { type: 'integer', example: 1, description: 'ID tài khoản wallet', },
        amount: { type: 'bigint', example: 500, description: 'Số tiền giao dịch (>= 1)', },
        type: { type: 'string', enum: ['RUT_TIEN',], example: 'RUT_TIEN', description: 'Loại giao dịch:  Rút', },
        // status: {type: 'string',enum: ['PENDING', 'SUCCESS', 'FAILED'],example: 'PENDING',description: 'Trạng thái giao dịch (mặc định là PENDING)',},
        // description: { type: 'string', example: 'thanh toán 500 booking id 123', description: 'Mô tả chi tiết giao dịch thanh toán booking', },
      },
      required: ['userWalletAccountId', 'amount', 'type'],
    },
  })
  async createRutTienPayment(@Req() req, @Body() paymentCoinDto: PaymentCoinDto): Promise<ResponseData<TransactionEntity>> {
    try {
      // console.log('User making payment:', req.user);
      return new ResponseData<TransactionEntity>(await this.transactionsService.createRutTienPayment(paymentCoinDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TransactionEntity>(null, error.message, error.status || HttpStatus.ERROR);
    }
  }

  @ApiOperation({ summary: 'Cập nhật số dư sau khi rút tiền id : id transaction' })
  @Post('UpdateBalanceRutTien/:id')
  async updateBalanceRutTien(@Req() req, @Param('id') id: string): Promise<ResponseData<TransactionEntity>> {
    try {
      // console.log('User making payment:', req.user);
      console.log('Transaction id for updating balance after withdrawal:', id);
      return new ResponseData<TransactionEntity>(await this.transactionsService.updateBalanceRutTien(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    }
    catch (error) {
      return new ResponseData<TransactionEntity>(null, error.message, error.status || HttpStatus.ERROR);
    }
  }
  // GET /tours/FilterPagination?page=1&limit=10&userId=1&slug=đà lạt&destination=Đà Lạt&domain=mt&time=3 ngày 2 đêm&status=active
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách lịch sử nạp rút có phân trang',
    description: '/tour-hashtags/FilterPagination?page=1&limit=10&hashtag=&tourId= (Lọc danh sách tours theo hashtag và tourId).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng tour mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'accountId', required: false, type: Number, example: 1, description: 'ID tài khoản wallet' })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'NAPTIEN', description: 'Loại giao dịch (NAPTIEN, RUTTIEN)' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'SUCCESS', description: 'Trạng thái giao dịch (SUCCESS, PENDING, EXPIRED, FAILED)' })

  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const accountId = parseInt(params.accountId);
      const type = params.type || '';
      const status = params.status || '';
      console.log(page, limit, accountId, type, status);
      const [data, total] = await this.transactionsService.FilterPagination(page, limit, accountId, type, status);
      // const data = [page, limit, search];
      const dataTransaction = {
        transactions: data,
        countTransaction: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(dataTransaction, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get('status/:id')
  async status(@Param('id') id: string) {
    const p = await this.transactionsService.getPayment(id);
    return p || { paymentId: id, status: 'UNKNOWN' };
  }

  // SSE endpoint: client connects here to receive events for this payment
  // @Get('stream/:id')
  // async stream(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
  //   res.headers('Content-Type', 'text/event-stream');
  //   res.setHeader('Cache-Control', 'no-cache');
  //   res.setHeader('Connection', 'keep-alive');
  //   // res.flushHeaders();

  //   // send a comment to keep connection
  //   res.write(':ok\n\n');

  //   const subscription = this.transactionsService.getStream(id).subscribe((payload) => {
  //     // SSE message
  //     res.write(`data: ${JSON.stringify(payload)}\n\n`);
  //     // if success, close connection optionally
  //     if (payload?.status === 'SUCCESS' || payload?.status === 'EXPIRED') {
  //       res.write('event: close\n');
  //       res.write('data: closing\n\n');
  //       subscription.unsubscribe();
  //       try { res.end(); } catch (e) { }
  //     }
  //   });

  //   // Also, on client disconnect, stop subscription
  //   req.on('close', () => {
  //     subscription.unsubscribe();
  //   });
  // }

  // Client mở kết nối SSE
  @Sse('stream/:id')
  stream(@Param('id') id: string): Observable<MessageEvent> {
    // Trả về Observable<MessageEvent> để Nest tự gửi SSE
    return this.transactionsService.getStream(id).pipe(
      map((payload) => ({
        data: payload,
      } as MessageEvent)),
    );
  }

  // Endpoint test: gọi để bắt đầu mô phỏng thanh toán
  @Get('simulate/:id')
  simulate(@Param('id') id: string) {
    this.transactionsService.simulatePaymentFlow(id);
    return { message: `Started simulation for payment ${id}` };
  }

  // @Get()
  // findAll() {
  //   return this.transactionsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.transactionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionsService.update(+id, updateTransactionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.transactionsService.remove(+id);
  // }
}
