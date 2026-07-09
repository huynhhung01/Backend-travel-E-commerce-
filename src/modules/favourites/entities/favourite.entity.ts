import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_favourite')
export class FavouriteEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    favouriteId: number;

    @Column({ type: 'tinyint', default: 1 })
    statusFavourite: number; // 1 = đã yêu thích, 0 = bỏ thích

    // 🔹 Quan hệ với User
    @ManyToOne(() => UserEntity, (user) => user.favourites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    // 🔹 Quan hệ với Tour
    @ManyToOne(() => TourEntity, (tour) => tour.favourites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tourId' })
    tour: TourEntity;
}
