import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tbl_checkout')
export class CheckoutEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    checkoutId: number;

    @Column()
    bookingId: number;

    @Column({ length: 255 })
    paymentMethod: string;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    paymentDate: Date;

    @Column({ type: 'decimal', scale: 2, default: 0, nullable: false })
    amount: number;

    @Column({ length: 255 })
    paymentStatus: string;

    @Column({ length: 255 })
    transactionId: string;

    // 🔗 Relation: Checkout -> Booking (N-1)
    @ManyToOne(() => BookingEntity, (booking) => booking.checkouts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: BookingEntity;

}
