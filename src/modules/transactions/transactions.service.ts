import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { RedisService } from '../redis/redis.service';
import { PaymentDto } from './dto/payment.dto';
import axios from 'axios';
import { Observable, Subject } from 'rxjs';
import { PaymentCoinDto } from './dto/paymentCoin.dto';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsCoinsService } from '../transactions-coins/transactions-coins.service';
import { FireBaseService } from '../fire-base/fire-base.service';


interface PaymentRecord {
  paymentId: string;
  transaction_content: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED';
  createdAt: Date;
}

@Injectable()
export class TransactionsService {

  // map paymentId -> polling controller (so we can cancel)
  private pollers = new Map<string, NodeJS.Timeout>();

  // map paymentId -> Subject (SSE stream)
  private streams = new Map<string, Subject<any>>();
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionsRepository: Repository<TransactionEntity>,
    // private bookingService: BookingsService,
    private accountsService: AccountsService,
    // private transactionCoinsService: TransactionsCoinsService,
    private readonly redisService: RedisService,

    private fireBaseService: FireBaseService,

  ) {

  }

  // async create(createPaymentDto: PaymentDto): Promise<TransactionEntity> {
  //   const booking = await this.bookingService.findOne(createPaymentDto.bookingId);
  //   if (!booking) {
  //     throw new NotFoundException(`Booking with id ${createPaymentDto.bookingId} not found`);
  //   }
  //   const paymentCode = Math.floor(Math.random() * 1000000);
  //   const totalPrice: number = Math.floor(booking.totalPrice);
  //   console.log('Total price:', totalPrice);
  //   const transaction_content = `MKH${createPaymentDto.userId} Thanh toan MDH${createPaymentDto.bookingId} chuyen tien ${totalPrice} paymentCode ${paymentCode}`;

  //   const record: PaymentRecord = {
  //     paymentId: `${createPaymentDto.userId}-${booking.bookingId}-${paymentCode}`,
  //     transaction_content: transaction_content,
  //     amount: booking.totalPrice,
  //     status: 'PENDING',
  //     createdAt: new Date(),
  //   };

  //   const transaction = this.transactionsRepository.create({
  //     paymentId: record.paymentId,
  //     transaction_content: transaction_content,
  //     // booking: booking,
  //   });
  //   await this.transactionsRepository.save(transaction);

  //   // await this.redisService.set(`payment:${createPaymentDto.userId}-${booking.bookingId}`, transaction_content, 300);

  //   // store in redis as JSON with TTL 330s
  //   await this.redisService.set(`payment:${record.paymentId}`, JSON.stringify(record), 330);

  //   // start polling SePay for this payment
  //   // this.startPollingSePay(paymentId);
  //   this.startPollingSePay(record, booking.bookingId);


  //   return transaction;
  // }

  async createPaymentCoin(paymentCoinDto: PaymentCoinDto): Promise<TransactionEntity> {
    const userAccount = await this.accountsService.findOne(paymentCoinDto.userWalletAccountId);
    if (!userAccount) {
      throw new NotFoundException(`User with id ${paymentCoinDto.userWalletAccountId} not found`);
    }
    const paymentCode = Math.floor(Math.random() * 1000000);
    const totalPrice: number = Math.floor(paymentCoinDto.amount);
    console.log('Total price:', totalPrice);
    const transaction_content = `MWL ${paymentCoinDto.userWalletAccountId} NAPTIEN ${totalPrice} paymentCode ${paymentCode}`;

    const record: PaymentRecord = {
      paymentId: `${paymentCoinDto.userWalletAccountId}-${paymentCode}`,
      transaction_content: transaction_content,
      amount: paymentCoinDto.amount,
      status: 'PENDING',
      createdAt: new Date(),
    };

    const transaction = this.transactionsRepository.create({
      paymentId: record.paymentId,
      transaction_content: transaction_content,
      account: userAccount,
      // booking: booking,
    });
    await this.transactionsRepository.save(transaction);

    // await this.redisService.set(`payment:${createPaymentDto.userId}-${booking.bookingId}`, transaction_content, 300);

    // store in redis as JSON with TTL 330s
    await this.redisService.set(`payment:${record.paymentId}`, JSON.stringify(record), 330);

    // start polling SePay for this payment
    // this.startPollingSePay(paymentId);
    this.startPollingSePay(record, userAccount.id);


    return transaction;
  }

  // Polling logic: every 10s, up to 5 minutes (or until success)
  private startPollingSePay(record: PaymentRecord, Idupdate: number) {
    // avoid double-starting
    if (this.pollers.has(record.paymentId)) return;
    console.log('Start polling SePay for paymentId', record.paymentId);
    const intervalMs = 10_000; // 10s
    const maxDurationMs = 5 * 60 * 1000; // 5min
    const startedAt = Date.now();

    // Dữ liệu cấu hình cho API call
    const SEPAY_API_URL = 'https://my.sepay.vn/userapi/transactions/list?account_number=5601999291&limit=20';
    // Lưu ý: Trong thực tế, bạn nên dùng biến môi trường (process.env.MY_TOKEN)
    // để bảo mật Token, nhưng ở đây ta dùng hardcoded token như trong yêu cầu.
    const BEARER_TOKEN = '5FVZTNIC4T68JWQGNJGXLMVSQWBRBFHMM0NROYS8CUK4FI99ASQU01VRVMD2GDFE';

    const fetchSepayTransactions = async () => {
      try {
        // call SePay API: replace with real endpoint + auth
        // const sepayEndpoint = (process.env.SEPAY_ENDPOINT || 'https://my.sepay.vn/userapi/transactions/list?account_number=5601999291&limit=20');

        // console.log(`Đang gửi yêu cầu GET đến: ${SEPAY_API_URL}`);
        const resp = await axios.get(SEPAY_API_URL, {
          timeout: 5000, // Thời gian chờ tối đa 5 giây
          headers: {
            // Header chuẩn cho nội dung JSON
            'Content-Type': 'application/json',
            // Header xác thực Bearer Token
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            // Bearer 5FVZTNIC4T68JWQGNJGXLMVSQWBRBFHMM0NROYS8CUK4FI99ASQU01VRVMD2GDFE
          },
        });

        // expected response shape: { status: 'SUCCESS' | 'PENDING' | 'FAILED' }

        const status = resp.data?.statusCode;
        console.log(resp.data);
        const transactionList = resp.data?.transactions || [];

        if (transactionList.length > 0) {

          console.log('Fetched transactions from SePay:', transactionList);
          // tìm giao dịch khớp với paymentId
          // const matchedTransaction = transactionList.find((tx) => tx.transaction_content === record.transaction_content && parseFloat(tx.amount) === parseFloat(record.amount.toString()));
          // && parseFloat(tx.amount_in) === parseFloat(record.amount.toString())
          const matchedTransaction = transactionList.find((tx) =>
            // tx.transaction_content === record.transaction_content
            tx.transaction_content?.includes(record.transaction_content)
          );
          console.log('Matched transaction:', matchedTransaction);
          if (matchedTransaction) {

            // update database transactions 
            const transaction = await this.transactionsRepository.findOne({
              where: { transaction_content: matchedTransaction.transaction_content },
            });
            // console.log('Updating transaction in DB:', transaction);
            if (transaction) {
              // transaction.status = 'SUCCESS';
              await this.transactionsRepository.update(transaction.transactionId, {
                // paymentId: record.paymentId,
                account_number: matchedTransaction.account_number,
                sub_account: matchedTransaction.sub_account,
                amount_in: parseFloat(matchedTransaction.amount_in),
                reference_number: matchedTransaction.reference_number,
                bank_brand_name: matchedTransaction.bank_brand_name,
                status: 'SUCCESS',
              });
            }
            // update database bookingStatus 
            // await this.bookingService.updateStatus(bookingId, 'confirmed');

            // update database account coin balance
            const accoutUpdate = await this.accountsService.updateBalance(Idupdate, parseFloat(matchedTransaction.amount_in));
            console.log(accoutUpdate);

            // send notification to client 
            // token: string, title: string, body: string
            const userAccountWallet = await this.accountsService.findById(Idupdate);

            if (userAccountWallet) {
              this.fireBaseService.sendToSpecificTokenUser(userAccountWallet.user.userId, 'Nạp Coin Thành Công ', `Bạn đã nạp thành công ${matchedTransaction.amount_in} coin vào ví của mình.`);
            }

            // update status redis + record stream
            await this.updateStatus(record, 'SUCCESS');


            // stop poller
            this.clearPoller(record);
            return;
          }
          // stop poller
          // this.clearPoller(paymentId);
          // return;
        }

        // if not success, continue until timeout
        if (Date.now() - startedAt > maxDurationMs) {
          await this.updateStatus(record, 'EXPIRED');
          // update database
          const transaction = await this.transactionsRepository.findOne({
            where: { paymentId: record.paymentId },
          });
          if (transaction) {
            await this.transactionsRepository.update(transaction.transactionId, {
              status: 'EXPIRED',
            });
          }

          this.clearPoller(record);
          console.log('Polling expired for paymentId', record.paymentId);
          return;
        }
      } catch (error) {
        // network / sepay error -> you can log, continue trying until timeout
        console.error('SePay poll error for', record, error?.message || error);
        if (Date.now() - startedAt > maxDurationMs) {
          await this.updateStatus(record, 'EXPIRED');
          this.clearPoller(record);
          return;
        }

        console.error('\n--- LỖI KHI GỌI API SEPAY ---');

        if (error.response) {
          // Lỗi từ server (status code 4xx hoặc 5xx)
          console.error('Status:', error.response.status);
          console.error('Data Lỗi:', error.response.data);
        } else if (error.request) {
          // Không nhận được phản hồi (ví dụ: network issue, timeout)
          console.error('Không nhận được phản hồi từ server. Request:', error.request);
        } else {
          // Các lỗi khác
          console.error('Lỗi:', error.message);
        }
      }
      // schedule next tick
      const t = setTimeout(fetchSepayTransactions, intervalMs);
      this.pollers.set(record.paymentId, t);
    };

    // start first tick immediately
    const t0 = setTimeout(fetchSepayTransactions, 0);
    this.pollers.set(record.paymentId, t0);
  }

  // update redis record
  private async updateStatus(record: PaymentRecord, status: PaymentRecord['status']) {
    const key = `payment:${record.paymentId}`;
    const raw = await this.redisService.get(key);
    if (!raw) return;
    const rec: PaymentRecord = JSON.parse(raw);
    rec.status = status;
    await this.redisService.set(key, JSON.stringify(rec), 300); // refresh TTL if you want
    this.pushEvent(record.paymentId, { paymentId: record.paymentId, status });
  }

  private clearPoller(record: PaymentRecord) {
    const t = this.pollers.get(record.paymentId);
    if (t) clearTimeout(t);
    this.pollers.delete(record.paymentId);
  }



  async getPayment(paymentId: string) {
    const raw = await this.redisService.get(`payment:${paymentId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  // tạo hoặc lấy stream SSE
  getStream(paymentId: string): Observable<PaymentRecord> {
    let subj = this.streams.get(paymentId);
    if (!subj) {
      subj = new Subject<PaymentRecord>();
      this.streams.set(paymentId, subj);
    }
    return subj.asObservable();
  }

  // ví dụ: check thanh toán và gửi cập nhật
  async simulatePaymentFlow(paymentId: string) {
    this.pushEvent(paymentId, { paymentId, status: 'PENDING' });
    setTimeout(() => {
      this.pushEvent(paymentId, { paymentId, status: 'SUCCESS' });
    }, 5000); // giả lập thành công sau 5s
  }

  // push event to connected clients
  private pushEvent(paymentId: string, payload: any) {
    const subj = this.streams.get(paymentId);
    if (subj) subj.next(payload);
  }

  async createRutTienPayment(paymentCoinDto: PaymentCoinDto): Promise<TransactionEntity> {
    const userAccount = await this.accountsService.findOne(paymentCoinDto.userWalletAccountId);
    if (!userAccount) {
      throw new NotFoundException(`User with id ${paymentCoinDto.userWalletAccountId} not found`);
    }

    if (userAccount.balance < paymentCoinDto.amount) {
      throw new NotFoundException(`Số dư trong ví không đủ để rút tiền`);
    }

    const paymentCode = Math.floor(Math.random() * 1000000);
    const totalPrice: number = Math.floor(paymentCoinDto.amount);
    console.log('Total price:', totalPrice);
    const transaction_content = `MWL ${paymentCoinDto.userWalletAccountId} RUTTIEN ${totalPrice} paymentCode ${paymentCode}`;

    return this.transactionsRepository.save({
      paymentId: `${paymentCoinDto.userWalletAccountId}-${paymentCode}`,
      transaction_content: transaction_content,
      amount_in: -Math.abs(paymentCoinDto.amount), // số âm cho rút tiền
      status: 'PENDING',
      account: userAccount,

    });
  }

  async updateBalanceRutTien(id: number): Promise<TransactionEntity | null> {
    const transaction = await this.transactionsRepository.findOne({
      where: { transactionId: id },
      relations: ['account'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    // update database account coin balance
    const accoutUpdate = await this.accountsService.updateBalance(transaction.account.id, transaction.amount_in);
    // console.log(accoutUpdate);
    // update transaction
    transaction.status = 'SUCCESS';
    transaction.transaction_date = new Date();
    await this.transactionsRepository.save(transaction);
    // send notification to client 
    const userAccountWallet = await this.accountsService.findById(transaction.account.id);

    if (userAccountWallet) {
      this.fireBaseService.sendToSpecificTokenUser(userAccountWallet.user.userId, 'Rút Coin Thành Công ', `Bạn đã rút thành công ${-transaction.amount_in} coin từ ví của mình.`);
    }

    const transactionUpdate = await this.transactionsRepository.findOne({
      where: { transactionId: id },
      relations: ['account'],
    });
    return transactionUpdate;
  }
  async FilterPagination(page: number, limit: number, accountId?: number, type?: string, status?: string): Promise<[TransactionEntity[], number]> {
    const query = this.transactionsRepository.createQueryBuilder('transactions')
      .leftJoinAndSelect('transactions.account', 'account');

    if (accountId) {
      query.andWhere('account.id = :accountId', { accountId });
    }
    if (type) {
      // ⭐ Match từ chính xác trong chuỗi (VD: "RUTTIEN" hoặc "NAPTIEN")
      // Ví dụ: "MWL 120011 RUTTIEN 500 paymentCode 958681"
      query.andWhere('transactions.transaction_content LIKE :type', { type: `%${type}%` });
      // query.andWhere('transactions.transaction_content LIKE :type', { type: `% ${type} %` });
    }
    if (status) {
      query.andWhere('transactions.status LIKE :status', { status: `%${status}%` });
    }

    query.orderBy('transactions.created_at', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
