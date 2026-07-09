import { TransactionEntity } from "src/modules/transactions/entities/transaction.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";


export enum AccountStatus {
    ACTIVE = 'active',
    FROZEN = 'frozen',
    CLOSED = 'closed',
}

@Entity('tbl_accounts')
export class AccountEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, })
    @Column({ type: 'bigint', default: 0, })
    balance: number;

    @Column({ type: 'varchar', length: 50, unique: true, })
    accountNumber: string;
    @Column({ type: 'varchar', length: 100, })
    accountName: string;
    @Column({ type: 'varchar', length: 50, })
    bankName: string;

    @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE, })
    status: AccountStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    // Liên kết đến bảng user
    @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    // Quan hệ 1 Booking có thể có nhiều Transaction
    @OneToMany(() => TransactionEntity, (transaction) => transaction.account)
    transactions: TransactionEntity[];
}
