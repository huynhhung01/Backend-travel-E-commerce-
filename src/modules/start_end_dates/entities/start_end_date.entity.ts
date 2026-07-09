import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { TourPromotionEntity } from "src/modules/tour_promotions/entities/tour_promotion.entity";
import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_start_end_date')
export class StartEndDateEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    dateId: number;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;


    @Column({ type: 'decimal', scale: 2, default: 0, nullable: false })
    priceAdult: number;

    @Column({ type: 'decimal', scale: 2, default: 0, nullable: false })
    priceChildren: number;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'int', default: 0 }) // số lượng sẳn có
    availability: number;

    // ===== Relation tới Tour =====
    @ManyToOne(() => TourEntity, (tour) => tour.startEndDates, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;

    @OneToMany(() => BookingEntity, (booking) => booking.date)
    bookings: BookingEntity[];

    // Quan hệ 1-n với bảng tour_promotion
    @OneToMany(() => TourPromotionEntity, (tourPromotion) => tourPromotion.date)
    tourPromotions: TourPromotionEntity[];
}
