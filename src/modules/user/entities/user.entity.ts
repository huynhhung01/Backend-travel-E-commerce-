import { AccountEntity } from "src/modules/accounts/entities/account.entity";
import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { FavouriteEntity } from "src/modules/favourites/entities/favourite.entity";
import { FcmEntity } from "src/modules/fcm/entities/fcm.entity";
import { ReviewEntity } from "src/modules/reviews/entities/review.entity";
import { TourEntity } from "src/modules/tours/entities/tour.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    SUPPLIER = 'supplier',
}

@Entity('tbl_users')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    google_id: string;

    @Column({ type: 'varchar', length: 100 })
    fullName: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    userName: string;

    @Column({ type: 'text' })
    passWord: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    // @CreateDateColumn({ type: 'timestamp', nullable: true })
    @Column({ type: 'timestamp', nullable: true })
    birthDay: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ipAddress: string;

    @Column({ type: 'enum', enum: ['y', 'n'], default: 'y' })
    isActive: string;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createDate: Date;

    // @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    @Column({ type: 'timestamp', nullable: true })
    updateDate: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    activation_token: string;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number;   // ví dụ: 21.0285

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number;  // ví dụ: 105.8542


    // 🆕 Trường role để phân quyền
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    /** Quan hệ: 1 User tạo nhiều Tour */
    @OneToMany(() => TourEntity, (tour) => tour.user)
    tours: TourEntity[];

    @OneToMany(() => BookingEntity, (booking) => booking.user)
    bookings: BookingEntity[];

    @OneToMany(() => ReviewEntity, (review) => review.user)
    reviews: ReviewEntity[];

    @OneToMany(() => FavouriteEntity, (favourite) => favourite.user)
    favourites: FavouriteEntity[];

    @OneToMany(() => FcmEntity, (fcm) => fcm.user)
    fcm: FcmEntity[];

    // Quan hệ 1:1 → 1 user có thể có 1 account
    // @OneToOne(() => AccountEntity, (account) => account.user)
    // account: AccountEntity;


    // Relations
    // @OneToMany(() => Booking, (booking) => booking.user)
    // bookings: Booking[];

    // @OneToMany(() => Favourite, (fav) => fav.user)
    // favourites: Favourite[];

    // @OneToMany(() => Review, (review) => review.user)
    // reviews: Review[];
}
