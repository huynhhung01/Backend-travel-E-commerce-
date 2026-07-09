import { TourPromotionEntity } from "src/modules/tour_promotions/entities/tour_promotion.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_promotion')
export class PromotionEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    promotionId: number;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'double', })
    discount: number;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: ['y', 'n'], // y = active, n = inactive
        default: 'y',
    })
    status: string;

    // Quan hệ 1-n với bảng tour_promotion
    @OneToMany(() => TourPromotionEntity, (tourPromotion) => tourPromotion.promotion)
    tourPromotions: TourPromotionEntity[];

    /** Quan hệ: 1 Promotion có thể gắn cho nhiều User hoặc Tour */
    // @OneToMany(() => UserPromotion, (userPromotion) => userPromotion.promotion)
    // userPromotions: UserPromotion[];

    // @OneToMany(() => StartEndDate, (date) => date.promotion)
    // startEndDates: StartEndDate[];

}
