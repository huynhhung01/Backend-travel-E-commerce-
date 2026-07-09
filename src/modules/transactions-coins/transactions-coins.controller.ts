import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TransactionsCoinsService } from './transactions-coins.service';
import { CreateTransactionsCoinDto } from './dto/create-transactions-coin.dto';
import { UpdateTransactionsCoinDto } from './dto/update-transactions-coin.dto';
import { TransactionsCoinEntity } from './entities/transactions-coin.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transactions-coins')
@Controller('transactions-coins')
export class TransactionsCoinsController {
  constructor(private readonly transactionsCoinsService: TransactionsCoinsService) { }

  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo transaction coin mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fromAccount: { type: 'integer', example: 1, description: 'ID tài khoản gửi', },
        toAccount: { type: 'integer', example: 2, description: 'ID tài khoản nhận (nullable nếu là rút tiền)', },
        amount: { type: 'integer', example: 500, description: 'Số tiền giao dịch (>= 1)', },
        type: { type: 'string', enum: ['NAP', 'RUT', 'THANH_TOAN', 'HOAN_TIEN'], example: 'THANH_TOAN', description: 'Loại giao dịch: Nạp, Rút, Thanh toán, Hoàn tiền', },
        // status: {type: 'string',enum: ['PENDING', 'SUCCESS', 'FAILED'],example: 'PENDING',description: 'Trạng thái giao dịch (mặc định là PENDING)',},
        description: { type: 'string', example: 'thanh toán 500 booking id 123', description: 'Mô tả chi tiết giao dịch thanh toán booking', },
      },
      required: ['amount', 'type'],
    },
  })
  async create(@Body() createTransactionsCoinDto: CreateTransactionsCoinDto): Promise<ResponseData<any>> {
    try {
      const job = await this.transactionsCoinsService.enqueueCreate(createTransactionsCoinDto);
      const payload = { jobId: job.id };
      return new ResponseData<any>(payload, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, error.status || HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<TransactionsCoinEntity[]>> {
    try {
      return new ResponseData<TransactionsCoinEntity[]>(await this.transactionsCoinsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TransactionsCoinEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }



  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách transactions-coins',
    description: '/transactions-coins/FilterPagination?page=1&limit=10&supplierIdId='
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng  mỗi trang' })
  @ApiQuery({ name: 'supplierId', required: true, type: Number, example: 1, description: 'ID supplier' })

  async filterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const supplierId = Number(params.supplierId);

      if (!params.supplierId || Number.isNaN(supplierId)) {
        return new ResponseData<any>(null, 'supplierId không hợp lệ', HttpStatus.ERROR);
      }
      console.log({ page, limit, supplierId });

      const [totalRevenue, data, total] = await this.transactionsCoinsService.filterPagination(page, limit, supplierId)
      // const data = [totalRevenue, page, limit];
      const dataResponse = {
        totalRevenue: totalRevenue,
        TransactionData: data,
        countTransactionData: total
      }
      return new ResponseData<any>(dataResponse, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<TransactionsCoinEntity>> {
    try {
      return new ResponseData<TransactionsCoinEntity>(await this.transactionsCoinsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<TransactionsCoinEntity>(null, error.message, HttpStatus.ERROR);
    }
  }


  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateTransactionsCoinDto: UpdateTransactionsCoinDto): Promise<TransactionsCoinEntity> {
  //   return this.transactionsCoinsService.update(+id, updateTransactionsCoinDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string): Promise<void> {
  //   return this.transactionsCoinsService.remove(+id);
  // }
}
