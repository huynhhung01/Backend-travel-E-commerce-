import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity, UserRole } from './entities/user.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('user')   // 👈 nhóm "users"
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('createUser')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Swap GER (có thể gửi JSON hoặc form-data)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Nguyễn Văn A' },
        userName: { type: 'string', example: 'nguyenvana' },
        email: { type: 'string', example: 'example@gmail.com' },
        passWord: { type: 'string', example: '123456' },
        phoneNumber: { type: 'string', example: '0987654321' },
        address: { type: 'string', example: '123 Đường ABC, Quận 1' },
        birthDay: { type: 'date', example: '1998-12-30' },
        role: { type: 'string', example: UserRole.USER, description: 'Vai trò người dùng: admin|supplier|user' },
        file: {
          type: 'string',
          format: 'binary', // 🔥 cái này bắt buộc để Swagger render nút "Choose File"
          description: 'Ảnh đại diện upload',
        },
        latitude: { type: 'number', example: '21.0285', description: 'Vĩ độ (latitude)' },
        longitude: { type: 'number', example: '105.8542', description: 'Kinh độ (longitude)' },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File): Promise<ResponseData<UserEntity>> {
    try {
      return new ResponseData<UserEntity>(await this.userService.create(createUserDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<UserEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<UserEntity[]>> {
    try {
      return new ResponseData<UserEntity[]>(await this.userService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<UserEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /user/GetAllPagination?page=1&limit=10
  @Get('GetAllPagination')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng có phân trang',
    description: '/user/GetAllPagination?page=1&limit=10  (Trả về danh sách người dùng kèm tổng số lượng, hỗ trợ phân trang).'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng người dùng mỗi trang (mặc định = 10)' })
  async findAllPagination(@Query() query: any): Promise<ResponseData<any>> {
    try {
      const { page, limit } = query;
      const [data, total] = await this.userService.findAllPagination(page, limit)
      // const data = [page, limit, search];
      const dataUsers = {
        users: data,
        countUsers: total
      }
      return new ResponseData<any>(dataUsers, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  // GET /user/FilterPagination?page=1&limit=10&fullName=&userName=&email=&phoneNumber=&role=&isActive=
  @Get('FilterPagination')
  @ApiOperation({
    summary: 'Lọc danh sách người dùng có phân trang',
    description: '/user/FilterPagination?page=1&limit=10&fullName=&userName=&email=&phoneNumber=&role=&isActive=  (Lọc danh sách người dùng theo tên, email, số điện thoại, vai trò, trạng thái, v.v.)'
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1, description: 'Trang hiện tại (mặc định = 1)' })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10, description: 'Số lượng người dùng mỗi trang (mặc định = 10)' })
  @ApiQuery({ name: 'fullName', required: false, type: String, example: 'Nguyễn Văn A', description: 'Tìm theo họ tên' })
  @ApiQuery({ name: 'userName', required: false, type: String, example: 'nguyenvana', description: 'Tìm theo tên đăng nhập' })
  @ApiQuery({ name: 'email', required: false, type: String, example: 'vana@gmail.com', description: 'Tìm theo email' })
  @ApiQuery({ name: 'phoneNumber', required: false, type: String, example: '0912345678', description: 'Tìm theo số điện thoại' })
  @ApiQuery({ name: 'role', required: false, type: String, example: 'admin', description: 'Lọc theo vai trò người dùng' })
  @ApiQuery({ name: 'isActive', required: false, type: String, example: 'y', description: "Trạng thái hoạt động ('y' = kích hoạt, 'n' = bị khóa)" })
  async FilterPagination(@Query() params): Promise<ResponseData<any>> {
    try {
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const fullName = params.fullName || '';
      const userName = params.userName || '';
      const email = params.email || '';
      const phoneNumber = params.phoneNumber || '';
      const role = params.role || '';
      const isActive = params.isActive || '';
      // const status = params.status || ''; // trạng thái 'active' | 'inactive' | 'pending'

      console.log({ page, limit, fullName, userName, email, phoneNumber, role, isActive });
      const [dataUsers, total] = await this.userService.FilterPagination(page, limit, fullName, userName, email, phoneNumber, role, isActive);
      // const data = [page, limit, search];
      const data = {
        users: dataUsers,
        countUser: total
      }
      // console.log(data);
      // console.log(total);
      return new ResponseData<any>(data, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(null, error.message, HttpStatus.ERROR);
    }
  }
  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  async findOne(@Param('id') id: string): Promise<ResponseData<UserEntity>> {
    try {
      return new ResponseData<UserEntity>(await this.userService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<UserEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  // @Patch(':id')
  @Patch('update/:id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ResponseData<UserEntity>> {
    try {
      // console.log("user", req.user);
      // console.log("id", req.user.id);
      return new ResponseData<UserEntity>(await this.userService.update(+id, updateUserDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<UserEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.userService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}
