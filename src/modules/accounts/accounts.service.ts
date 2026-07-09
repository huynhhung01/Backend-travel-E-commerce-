import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { AccountEntity } from './entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {

  constructor(
    @InjectRepository(AccountEntity)
    private accountsRepository: Repository<AccountEntity>,
    private userService: UserService,

  ) {

  }

  async create(createAccountDto: CreateAccountDto): Promise<AccountEntity> {
    const user = await this.userService.getUserById(createAccountDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${createAccountDto.userId} not found`);
    }

    const AccountNumberExisting = await this.accountsRepository.findOne({
      where:
        { accountNumber: createAccountDto.accountNumber, bankName: createAccountDto.bankName }
    });
    if (AccountNumberExisting) {
      throw new NotFoundException(`Account with account number ${createAccountDto.accountNumber} and bank name ${createAccountDto.bankName} already exists`);
    }

    return this.accountsRepository.save({
      ...createAccountDto,
      user: user,
    });
  }

  async findAll(): Promise<AccountEntity[]> {
    return this.accountsRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[AccountEntity[], number]> {
    const query = this.accountsRepository.createQueryBuilder('account');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async filterPagination(page: number, limit: number, userId: number, accountNumber: string, accountName: string, bankName: string, status: string): Promise<[AccountEntity[], number]> {
    const query = this.accountsRepository.createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user');
    if (userId) {
      query.andWhere('user.userId = :userId', { userId });
    }
    if (accountNumber) {
      query.andWhere('account.accountNumber LIKE :accountNumber', { accountNumber: `%${accountNumber}%` });
    }
    if (accountName) {
      query.andWhere('account.accountName LIKE :accountName', { accountName: `%${accountName}%` });
    }
    if (bankName) {
      query.andWhere('account.bankName LIKE :bankName', { bankName: `%${bankName}%` });
    }
    if (status) {
      query.andWhere('account.status = :status', { status });
    }
    query.orderBy('account.id', 'DESC');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }


  async findByUserId(userId: number): Promise<AccountEntity | null> {
    return this.accountsRepository.findOne({ where: { user: { userId: userId } } });
  }

  async findOne(id: number): Promise<AccountEntity | null> {
    return this.accountsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async findById(id: number | undefined): Promise<AccountEntity | null> {
    return this.accountsRepository.findOne({ where: { id: id }, relations: ['user'] });
  }

  async update(id: number, updateAccountDto: UpdateAccountDto): Promise<AccountEntity> {
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    const user = await this.userService.getUserById(updateAccountDto.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${updateAccountDto.userId} not found`);
    }
    await this.accountsRepository.update(id, {
      ...updateAccountDto,
      user: user,
    });
    return this.findOne(id) as Promise<AccountEntity>;
  }

  async updateBalance(id: number, amount: number): Promise<AccountEntity | null> {
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    account.balance = Number(account.balance) + Number(amount);
    await this.accountsRepository.update(account.id, {
      balance: account.balance,
    });
    // const accountReturn = this.findOne(id) as Promise<AccountEntity>;
    // console.log('Updated account balance:', accountReturn);
    return this.findOne(id);
  }
  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }

    await this.accountsRepository.delete(id);
  }
}
