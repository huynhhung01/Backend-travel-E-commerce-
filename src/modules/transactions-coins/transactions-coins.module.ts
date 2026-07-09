import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TransactionsCoinsService } from './transactions-coins.service';
import { TransactionsCoinsController } from './transactions-coins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsCoinEntity } from './entities/transactions-coin.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { BookingsModule } from '../bookings/bookings.module';
import { TransactionsCoinsProcessor } from './transactions-coins.processor';


@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionsCoinEntity]),
    AccountsModule,
    BullModule.registerQueue({
      name: 'transactions-coins',
    }),
    // BookingsModule,
    // forwardRef(() => BookingsModule),
  ],
  controllers: [TransactionsCoinsController],
  providers: [TransactionsCoinsService, TransactionsCoinsProcessor],
  exports: [TransactionsCoinsService],
})
export class TransactionsCoinsModule { }
