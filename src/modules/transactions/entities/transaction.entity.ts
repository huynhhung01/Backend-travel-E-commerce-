import { AccountEntity } from "src/modules/accounts/entities/account.entity";
import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_transactions')
export class TransactionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    transactionId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentId: string | null;
    // default: () => "'0000-00-00 00:00:00'"

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    transaction_date: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    account_number: string | null;

    @Column({ type: 'varchar', length: 250, nullable: true })
    sub_account: string | null;

    @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
    amount_in: number;

    // @Column({ type: 'varchar', length: 250, nullable: true })
    // code: string | null;

    @Column({ type: 'text', nullable: true })
    transaction_content: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reference_number: string | null;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    bank_brand_name: string | null;

    // @ManyToOne(() => BookingEntity, (booking) => booking.transactions, {
    //     onDelete: 'CASCADE', // hoặc 'CASCADE' tùy logic
    // })
    // @JoinColumn({ name: 'bookingId' })
    // booking: BookingEntity;

    @ManyToOne(() => AccountEntity, (account) => account.transactions, {
        onDelete: 'CASCADE', // hoặc 'CASCADE' tùy logic
    })
    @JoinColumn({ name: 'accountId' })
    account: AccountEntity;

    @Column({ default: 'PENDING' })
    status: string; // giá trị có thể là 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED'

}