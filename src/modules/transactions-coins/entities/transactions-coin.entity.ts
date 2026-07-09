import { AccountEntity } from "src/modules/accounts/entities/account.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum TransactionType {
    NAP = 'NAP', // Nạp tiền
    RUT = 'RUT', // Rút tiền
    THANH_TOAN = 'THANH_TOAN', // Thanh toán tour
    HOAN_TIEN = 'HOAN_TIEN', // Hoàn tiền
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

@Entity('tbl_transactions_coins')
export class TransactionsCoinEntity extends BaseEntity {
    // Define your entity columns here
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'from_account_id' })
    fromAccount: AccountEntity;

    @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'to_account_id' })
    toAccount: AccountEntity;

    @Column({
        // type: 'decimal',
        // precision: 18,
        // scale: 2,
        type: 'int',
    })
    amount: number;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

}
