import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_timeline')
export class TimelineEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    timeLineId: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    tl_title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tl_placeName: string;

    @Column({ type: 'text', nullable: false })
    tl_description: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageTimeLine: string;

    // ===== Relation tới bảng Tour =====
    @ManyToOne(() => TourEntity, (tour) => tour.timelines, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;
}
