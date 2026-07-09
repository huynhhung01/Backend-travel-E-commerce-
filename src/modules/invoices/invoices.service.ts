import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectRepository(InvoiceEntity)
    private invoicesRepository: Repository<InvoiceEntity>,
    private bookingService: BookingsService,
  ) {

  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceEntity> {
    const booking = await this.bookingService.findOne(createInvoiceDto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${createInvoiceDto.bookingId} not found`);
    }
    // const invoice = this.invoicesRepository.create(createInvoiceDto);
    return this.invoicesRepository.save({
      ...createInvoiceDto,
      booking: booking,
    });
  }

  async findAll(): Promise<InvoiceEntity[]> {
    return this.invoicesRepository.find({ relations: ['booking'] });
  }

  async findOne(id: number): Promise<InvoiceEntity | null> {
    const invoice = await this.invoicesRepository.findOne({ where: { invoiceId: id }, relations: ['booking'] });
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceEntity | null> {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    const booking = await this.bookingService.findOneByID(updateInvoiceDto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${updateInvoiceDto.bookingId} not found`);
    }

    await this.invoicesRepository.update(id, {
      amount: updateInvoiceDto.amount,
      booking: booking,

    });
    return this.invoicesRepository.findOne({ where: { invoiceId: id } });
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    await this.invoicesRepository.delete(id);
  }
}
