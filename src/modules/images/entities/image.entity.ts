import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_images')
export class ImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    imageId: number;

    @Column()
    tourId: number;

    @Column({ type: 'varchar', length: 255 })
    imageURL: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    // @CreateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    uploadDate: Date;

    // 🔗 Relation với Tour
    @ManyToOne(() => TourEntity, (tour) => tour.images, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;
}
