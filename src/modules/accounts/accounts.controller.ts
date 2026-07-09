import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ResponseData } from 'src/global/globalClass';
import { AccountEntity, AccountStatus } from './entities/account.entity';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@ApiTags('wallet-accounts')   // 👈 nhóm "accounts"
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post()
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', example: 6, description: 'ID người tạo' },
        accountNumber: { type: 'string', example: '036874669435', description: 'Số tài khoản' },
        bankName: { type: 'string', example: 'ABC', description: 'Tên ngân hàng' },
        accountName: { type: 'string', example: 'NGUYEN PHAN THANH AN', description: 'Tên tài khoản' },

      },
      required: ['userId', 'accountNumber', 'accountName', 'bankName']
    }
  })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<ResponseData<AccountEntity>> {
    try {
      return new ResponseData<AccountEntity>(await this.accountsService.create(createAccountDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<AccountEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<AccountEntity[]>> {
    try {
      return new ResponseData<AccountEntity[]>(await this.accountsService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<AccountEntity[]>(null, error.message, HttpStatus.ERROR);
    }
  }

  // GET /accounts/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách bookings có phân trang',
    description: '/accounts/GetAllPagination?page=1&limit=10 (API này trả về danh sách tất cả bookings có hỗ trợ phân trang (page, limit)).',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng bookings trên mỗi trang' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.accountsService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataAccounts = {
        accounts: data,
        countAccounts: total
      }
      return new ResponseData<any>(dataAccounts, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }


  // GET /accounts/FilterPagination?page=1&limit=10&fullName=&email=&phoneNumber=&bookingStatus=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc và phân trang danh sách bookings',
    description: '/accounts/FilterPagination?page=1&limit=10&fullName=&email=&phoneNumber=&bookingStatus= (API trả về danh sách accounts có thể lọc theo họ tên, email, số điện thoại và trạng thái, đồng thời hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng bookings mỗi trang' })
  @ApiQuery({ name: 'userId', required: false, type: Number, example: 1, description: 'ID người dùng (tìm kiếm theo người dùng)' })
  @ApiQuery({ name: 'accountNumber', required: false, type: String, example: '089745625345', description: 'Từ khóa tìm kiếm theo AccountNumber' })
  @ApiQuery({ name: 'bankName', required: false, type: String, example: 'BIDV', description: 'Từ khóa tìm kiếm theo tên ngân hàng' })
  @ApiQuery({ name: 'accountName', required: false, type: String, example: '0987654321', description: 'Từ khóa tìm kiếm theo số tên chủ tài khoản ngân hàng' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active', description: 'Trạng thái account (active, frozen,closed...)' })
  async FilterPagination(@Query() params: any): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const userId = params.userId; // ID người dùng (tìm kiếm theo người dùng)
      const accountNumber = params.accountNumber || ''; // Từ khóa tìm kiếm theo AccountNumber
      const bankName = params.bankName || ''; // Từ khóa tìm kiếm theo tên ngân hàng
      const accountName = params.accountName || ''; // Từ khóa tìm kiếm theo tên chủ tài khoản
      const status = params.status || ''; // Trạng thái account
      console.log({ page, limit, userId, accountNumber, bankName, accountName, status });

      const [data, total] = await this.accountsService.filterPagination(page, limit, userId, accountNumber, bankName, accountName, status)
      // const data = [page, limit, search];
      const dataAccounts = {
        accounts: data,
        countAccounts: total
      }
      return new ResponseData<any>(dataAccounts, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<AccountEntity>> {
    try {
      return new ResponseData<AccountEntity>(await this.accountsService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<AccountEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto): Promise<ResponseData<AccountEntity>> {
    try {
      return new ResponseData<AccountEntity>(await this.accountsService.update(+id, updateAccountDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<AccountEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.accountsService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
