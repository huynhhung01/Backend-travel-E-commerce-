import { CheckoutEntity } from "src/modules/checkouts/entities/checkout.entity";
import { InvoiceEntity } from "src/modules/invoices/entities/invoice.entity";
import { StartEndDateEntity } from "src/modules/start_end_dates/entities/start_end_date.entity";
import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { TransactionEntity } from "src/modules/transactions/entities/transaction.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('tbl_booking')
export class BookingEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    bookingId: number;

    // === BOOKING INFO ===

    @Column({ type: 'varchar', length: 255 })
    fullName: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 15 })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    bookingDate: Date;

    @Column({ type: 'int' })
    numAdults: number;

    @Column({ type: 'int' })
    numChildren: number;

    @Column({ type: 'decimal', scale: 2, default: 0 })
    totalPrice: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    codeCoupon: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'confirmed', 'canceled', 'paid'],
        default: 'pending',
    })
    bookingStatus: string;

    @Column({ type: 'boolean', default: true })
    receiveEmail: boolean;

    // === RELATIONS ===
    // 🔗 Booking -> Checkout (1-N)
    @OneToMany(() => CheckoutEntity, (checkout) => checkout.booking)
    checkouts: CheckoutEntity[];

    @ManyToOne(() => TourEntity, (tour) => tour.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;

    @ManyToOne(() => StartEndDateEntity, (date) => date.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dateId' })
    date: StartEndDateEntity;

    @ManyToOne(() => UserEntity, (user) => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;


    @OneToMany(() => InvoiceEntity, (invoice) => invoice.booking)
    invoices: InvoiceEntity[];

    // // Quan hệ 1 Booking có thể có nhiều Transaction
    // @OneToMany(() => TransactionEntity, (transaction) => transaction.booking)
    // transactions: TransactionEntity[];

    // @OneToOne(() => Checkout, (checkout) => checkout.booking)
    // checkout: Checkout;

    // @OneToOne(() => Invoice, (invoice) => invoice.booking)
    // invoice: Invoice;

}
