import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateTransactionsCoinDto } from './dto/create-transactions-coin.dto';
import { UpdateTransactionsCoinDto } from './dto/update-transactions-coin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsCoinEntity, TransactionStatus, TransactionType } from './entities/transactions-coin.entity';
import { DataSource, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { AccountEntity } from '../accounts/entities/account.entity';
import { BookingStatus } from '../bookings/dto/create-booking.dto';
// import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class TransactionsCoinsService {
  constructor(
    @InjectRepository(TransactionsCoinEntity)
    private transactionsCoinsRepository: Repository<TransactionsCoinEntity>,
    private accountsService: AccountsService,
    private dataSource: DataSource,
    @InjectQueue('transactions-coins') private readonly transactionsCoinsQueue: Queue,
    // private bookingService: BookingsService,
  ) {

  }

  async enqueueCreate(createTransactionsCoinDto: CreateTransactionsCoinDto) {
    // Đẩy job vào hàng đợi để xử lý bất đồng bộ, tăng throughput
    return this.transactionsCoinsQueue.add('create', createTransactionsCoinDto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async create(createTransactionsCoinDto: CreateTransactionsCoinDto): Promise<TransactionsCoinEntity> {
    // const transaction = this.transactionsRepository.create(createTransactionsCoinDto);
    const { type, amount } = createTransactionsCoinDto;

    console.log('createTransactionsCoinDto', createTransactionsCoinDto);

    // Kiểm tra dữ liệu đầu vào
    if (amount <= 0) throw new BadRequestException('Số tiền phải lớn hơn 0');
    if (!createTransactionsCoinDto.toAccount && type !== TransactionType.RUT)
      throw new BadRequestException('Thiếu tài khoản nhận');


    // Lấy tài khoản gửi và nhận
    // const fromAccount = await this.accountsService.findById(createTransactionsCoinDto.fromAccount);

    // const toAccount = await this.accountsService.findById(createTransactionsCoinDto.toAccount);

    // if (!fromAccount) throw new NotFoundException(`Tài khoản gửi ${createTransactionsCoinDto.fromAccount} không tồn tại`);
    // if (!toAccount) throw new NotFoundException(`Tài khoản nhận ${createTransactionsCoinDto.toAccount} không tồn tại`);


    // Tạo QueryRunner để đảm bảo ACID Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      let fromAccount: AccountEntity | null = null;
      let toAccount: AccountEntity | null = null;

      // Helper: lấy và lock account theo id (pessimistic write)
      const lockAccount = async (id: number) => {
        return await queryRunner.manager
          .createQueryBuilder(AccountEntity, 'account')
          .setLock('pessimistic_write')
          .where('account.id = :id', { id })
          .getOne();
      };

      switch (type) {
        case TransactionType.NAP: {
          console.log('NẠP COIN');
          if (!createTransactionsCoinDto.toAccount) throw new BadRequestException('Thiếu tài khoản nhận khi nạp');
          toAccount = await lockAccount(createTransactionsCoinDto.toAccount);
          if (!toAccount) throw new NotFoundException(`Tài khoản nhận ${createTransactionsCoinDto.toAccount} không tồn tại`);
          toAccount.balance = Number(toAccount.balance) + Number(amount);
          await queryRunner.manager.save(AccountEntity, toAccount);
          break;
        }

        case TransactionType.RUT: {
          console.log('RÚT COIN');
          if (!createTransactionsCoinDto.fromAccount) throw new BadRequestException('Thiếu tài khoản gửi khi rút');
          fromAccount = await lockAccount(createTransactionsCoinDto.fromAccount);
          if (!fromAccount) throw new NotFoundException(`Tài khoản gửi ${createTransactionsCoinDto.fromAccount} không tồn tại`);
          if (Number(fromAccount.balance) < Number(amount))
            throw new BadRequestException('Số dư không đủ để rút');
          fromAccount.balance = Number(fromAccount.balance) - Number(amount);
          await queryRunner.manager.save(AccountEntity, fromAccount);
          break;
        }

        case TransactionType.THANH_TOAN: {
          console.log('THANH TOÁN COIN');
          if (!createTransactionsCoinDto.fromAccount || !createTransactionsCoinDto.toAccount)
            throw new BadRequestException('Thiếu tài khoản gửi hoặc nhận khi thanh toán');
          if (createTransactionsCoinDto.fromAccount === createTransactionsCoinDto.toAccount)
            throw new BadRequestException('Không thể thanh toán cho chính mình');

          // Lock theo thứ tự id để giảm deadlock (luôn lock id nhỏ trước)
          const ids = [createTransactionsCoinDto.fromAccount, createTransactionsCoinDto.toAccount].map(Number);
          const [firstId, secondId] = ids[0] < ids[1] ? [ids[0], ids[1]] : [ids[1], ids[0]];

          const firstAccount = await lockAccount(firstId);
          const secondAccount = await lockAccount(secondId);

          // Gán đúng biến from/to một cách an toàn (tránh truy cập .id khi null)
          const accounts = [firstAccount, secondAccount];
          const fromId = Number(createTransactionsCoinDto.fromAccount);
          const toId = Number(createTransactionsCoinDto.toAccount);
          fromAccount = accounts.find(a => a && a.id === fromId) ?? null;
          toAccount = accounts.find(a => a && a.id === toId) ?? null;

          if (!fromAccount) throw new NotFoundException(`Tài khoản gửi ${createTransactionsCoinDto.fromAccount} không tồn tại`);
          if (!toAccount) throw new NotFoundException(`Tài khoản nhận ${createTransactionsCoinDto.toAccount} không tồn tại`);
          if (Number(fromAccount.balance) < Number(amount))
            throw new BadRequestException('Số dư tài khoản gửi không đủ');

          fromAccount.balance = Number(fromAccount.balance) - Number(amount);
          toAccount.balance = Number(toAccount.balance) + Number(amount);

          await queryRunner.manager.save(AccountEntity, [fromAccount, toAccount]);
          // update status booking
          // await this.bookingsRepository.update(booking.id, { bookingStatus: BookingStatus.CONFIRMED });

          break;
        }

        case TransactionType.HOAN_TIEN: {
          console.log('HOÀN TIỀN COIN');
          if (!createTransactionsCoinDto.fromAccount || !createTransactionsCoinDto.toAccount)
            throw new BadRequestException('Thiếu tài khoản gửi hoặc nhận khi hoàn tiền');

          // Lock theo thứ tự id để giảm deadlock
          const ids = [createTransactionsCoinDto.fromAccount, createTransactionsCoinDto.toAccount].map(Number);
          const [firstId, secondId] = ids[0] < ids[1] ? [ids[0], ids[1]] : [ids[1], ids[0]];

          const firstAccount = await lockAccount(firstId);
          const secondAccount = await lockAccount(secondId);

          // fromAccount = firstAccount.id === createTransactionsCoinDto.fromAccount ? firstAccount : secondAccount;
          // toAccount = firstAccount.id === createTransactionsCoinDto.toAccount ? firstAccount : secondAccount;

          // Gán đúng biến from/to một cách an toàn (tránh truy cập .id khi null)
          const accounts = [firstAccount, secondAccount];
          const fromId = Number(createTransactionsCoinDto.fromAccount);
          const toId = Number(createTransactionsCoinDto.toAccount);
          fromAccount = accounts.find(a => a && a.id === fromId) ?? null;
          toAccount = accounts.find(a => a && a.id === toId) ?? null;


          if (!fromAccount) throw new NotFoundException(`Tài khoản gửi ${createTransactionsCoinDto.fromAccount} không tồn tại`);
          if (!toAccount) throw new NotFoundException(`Tài khoản nhận ${createTransactionsCoinDto.toAccount} không tồn tại`);

          toAccount.balance = Number(toAccount.balance) + Number(amount);
          fromAccount.balance = Number(fromAccount.balance) - Number(amount);

          await queryRunner.manager.save(AccountEntity, [fromAccount, toAccount]);
          // update status booking

          break;
        }

        default:
          throw new BadRequestException('Loại giao dịch không hợp lệ');
      }
      // ✅ Ghi lại bản ghi transaction
      const transaction = new TransactionsCoinEntity();
      transaction.amount = amount;
      transaction.type = type;
      transaction.status = TransactionStatus.SUCCESS;
      transaction.description = createTransactionsCoinDto.description || this.getTransactionDescription(type);

      // Gán relations bằng cast/ bracket-notation để tránh lỗi TypeScript khi tên thuộc tính khác
      if (fromAccount) (transaction as any)['fromAccount'] = fromAccount;
      if (toAccount) (transaction as any)['toAccount'] = toAccount;


      const savedTransaction = await queryRunner.manager.save(TransactionsCoinEntity, transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || 'Lỗi khi thực hiện giao dịch');
    } finally {
      await queryRunner.release();
    }
    // return await this.transactionsCoinsRepository.save({});
  }

  // 👉 Mô tả mặc định cho các loại giao dịch
  private getTransactionDescription(type: TransactionType): string {
    switch (type) {
      case TransactionType.NAP:
        return 'Nạp coin vào tài khoản';
      case TransactionType.RUT:
        return 'Rút coin khỏi tài khoản';
      case TransactionType.THANH_TOAN:
        return 'Thanh toán tour du lịch';
      case TransactionType.HOAN_TIEN:
        return 'Hoàn tiền tour';
      default:
        return 'Giao dịch không xác định';
    }
  }

  async findAll(): Promise<TransactionsCoinEntity[]> {
    return await this.transactionsCoinsRepository.find();
  }

  async findOne(id: number): Promise<TransactionsCoinEntity> {
    return await this.transactionsCoinsRepository.findOne({ where: { id } }) as TransactionsCoinEntity;
  }

  async filterPagination(page: number, limit: number, SupplierId: number): Promise<any> {
    const accountSupplier = await this.accountsService.findByUserId(SupplierId);
    if (!accountSupplier) {
      throw new NotFoundException(`Account not found for supplier id ${SupplierId}`);
    }
    // 1. Query lấy tổng revenue
    const totalRevenueRaw = await this.transactionsCoinsRepository
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'totalRevenue')
      .where('t.to_account_id = :toId', { toId: accountSupplier.id })
      .andWhere('t.status = :s', { s: 'SUCCESS' })
      .getRawOne();

    const totalRevenue = Number(totalRevenueRaw.totalRevenue) || 0;

    console.log('totalRevenue', totalRevenue);
    // 2. Query phân trang
    const queryBuilder = this.transactionsCoinsRepository
      .createQueryBuilder('t')
      .where('t.to_account_id = :toId', { toId: accountSupplier.id })
      .andWhere('t.status = :s', { s: 'SUCCESS' })
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return [totalRevenue, data, total];
  }


  // async update(id: number, updateTransactionsCoinDto: UpdateTransactionsCoinDto): Promise<TransactionsCoinEntity | null> {
  //   await this.transactionsRepository.update(id, updateTransactionsCoinDto);
  //   return this.findOne(id);
  // }

  // async remove(id: number): Promise<void> {
  //   await this.transactionsRepository.delete(id);
  // }
}
