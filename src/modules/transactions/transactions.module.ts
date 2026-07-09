import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { RedisModule } from '../redis/redis.module';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsCoinsModule } from '../transactions-coins/transactions-coins.module';
import { FireBaseModule } from '../fire-base/fire-base.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    // BookingsModule,
    AccountsModule,
    // TransactionsCoinsModule,
    RedisModule,
    FireBaseModule

  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
