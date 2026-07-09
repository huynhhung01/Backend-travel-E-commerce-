import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_reviews')
export class ReviewEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    reviewId: number;

    @Column({ type: 'float', nullable: false })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @ManyToOne(() => TourEntity, (tour) => tour.reviewsComment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;

    @ManyToOne(() => UserEntity, (user) => user.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
}

