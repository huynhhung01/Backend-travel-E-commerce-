import { HashtagEntity } from "src/modules/hashtags/entities/hashtag.entity";
import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_tour_hashtag')
export class TourHashtagEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    tourHashTagId: number;

    @ManyToOne(() => TourEntity, (tour) => tour.tourHashtags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;

    @ManyToOne(() => HashtagEntity, (hashtag) => hashtag.tourHashtags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'hashtagId' })
    hashtag: HashtagEntity;
}
