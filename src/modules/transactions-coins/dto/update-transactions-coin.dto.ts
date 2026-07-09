import { PartialType } from '@nestjs/swagger';
import { CreateTransactionsCoinDto } from './create-transactions-coin.dto';

export class UpdateTransactionsCoinDto extends PartialType(CreateTransactionsCoinDto) {}
