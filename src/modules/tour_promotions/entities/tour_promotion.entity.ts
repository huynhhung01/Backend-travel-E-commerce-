import { PromotionEntity } from "src/modules/promotions/entities/promotion.entity";
import { StartEndDateEntity } from "src/modules/start_end_dates/entities/start_end_date.entity";
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_tour_promotion')
export class TourPromotionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    tourPromotionId: number;

    // Quan hệ với bảng start_end_date (mỗi tour theo ngày có thể có nhiều khuyến mãi)
    @ManyToOne(() => StartEndDateEntity, (date) => date.tourPromotions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dateId' })
    date: StartEndDateEntity;

    // Quan hệ với bảng promotion (một khuyến mãi áp dụng cho nhiều tour)
    @ManyToOne(() => PromotionEntity, (promotion) => promotion.tourPromotions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotionId' })
    promotion: PromotionEntity;
}
