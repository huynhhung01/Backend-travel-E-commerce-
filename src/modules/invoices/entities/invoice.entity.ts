import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('tbl_invoice')
export class InvoiceEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    invoiceId: number;

    @Column({ type: 'decimal', scale: 2, default: 0, nullable: false })
    amount: number;

    // @CreateDateColumn({ type: 'timestamp', nullable: false })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateIssued: Date;

    @ManyToOne(() => BookingEntity, (booking) => booking.invoices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: BookingEntity;
}
