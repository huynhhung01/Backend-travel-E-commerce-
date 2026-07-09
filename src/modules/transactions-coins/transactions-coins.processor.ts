import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { TransactionsCoinsService } from './transactions-coins.service';
import { CreateTransactionsCoinDto } from './dto/create-transactions-coin.dto';

@Processor('transactions-coins')
export class TransactionsCoinsProcessor {
  constructor(private readonly transactionsCoinsService: TransactionsCoinsService) { }

  // Handle create transaction jobs with limited concurrency for throughput
  @Process({ name: 'create', concurrency: 5 })
  async handleCreate(job: Job<CreateTransactionsCoinDto>) {
    return this.transactionsCoinsService.create(job.data);
  }
}
