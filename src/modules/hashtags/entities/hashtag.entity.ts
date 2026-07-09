import { TourHashtagEntity } from "src/modules/tour_hashtags/entities/tour_hashtag.entity";
import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('tbl_hashtag')
export class HashtagEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    hashtagId: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @OneToMany(() => TourHashtagEntity, (tourHashtag) => tourHashtag.hashtag)
    tourHashtags: TourHashtagEntity[];
}
