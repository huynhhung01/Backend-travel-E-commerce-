import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceEntity } from './entities/invoice.entity';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('invoices')   // 👈 nhóm "invoices"
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'integer', example: 123, description: 'ID của booking liên kết với hóa đơn' },
        amount: { type: 'integer', minimum: 0, example: 5000000, description: 'Tổng số tiền của hóa đơn (>= 0)' },
        // dateIssued: { type: 'string', format: 'date-time', example: '2025-09-25T10:00:00.000Z', description: 'Ngày phát hành hóa đơn' },
      },
      required: ['bookingId', 'amount'],
    },
  })
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<ResponseData<InvoiceEntity>> {
    try {
      return new ResponseData<InvoiceEntity>(await this.invoicesService.create(createInvoiceDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<InvoiceEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<InvoiceEntity[]>> {
    try {
      return new ResponseData<InvoiceEntity[]>(await this.invoicesService.findAll(), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<InvoiceEntity[]>(null, HttpMessage.ERROR, HttpStatus.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<InvoiceEntity>> {
    try {
      return new ResponseData<InvoiceEntity>(await this.invoicesService.findOne(+id), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<InvoiceEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto): Promise<ResponseData<InvoiceEntity>> {
    try {
      return new ResponseData<InvoiceEntity>(await this.invoicesService.update(+id, updateInvoiceDto), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<InvoiceEntity>(null, error.message, HttpStatus.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.invoicesService.remove(+id);
      return new ResponseData<void>(null, HttpMessage.SUCCESS, HttpStatus.SUCCESS);
    } catch (error) {
      return new ResponseData<void>(null, error.message, HttpStatus.ERROR);
    }
  }
}

