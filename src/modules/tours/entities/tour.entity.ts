import { BookingEntity } from "src/modules/bookings/entities/booking.entity";
import { FavouriteEntity } from "src/modules/favourites/entities/favourite.entity";
import { ImageEntity } from "src/modules/images/entities/image.entity";
import { ReviewEntity } from "src/modules/reviews/entities/review.entity";
import { StartEndDateEntity } from "src/modules/start_end_dates/entities/start_end_date.entity";
import { TimelineEntity } from "src/modules/timelines/entities/timeline.entity";
import { TourHashtagEntity } from "src/modules/tour_hashtags/entities/tour_hashtag.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tbl_tour')
export class TourEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    tourId: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ type: 'varchar', length: 255, unique: true, })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    destination: string;

    @Column({ type: 'text', nullable: true })
    highlight: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    time: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reviews: string;

    @Column({ type: 'int', default: 0 })
    reviewCount: number;

    @Column({
        type: 'enum',
        enum: ['mb', 'mt', 'mn', 'mdnb', 'mtnb'],
        nullable: true,
    })
    domain: string;

    /** Trường mới thêm */
    @Column({ type: 'int', default: 0 })
    quantity: number;

    @Column({ type: 'float', default: 0 })
    starAvg: number;

    @Column({ type: 'int', default: 0 })
    countComplete: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ default: 'active' })
    status: string; // giá trị có thể là 'active' | 'inactive' | 'pending'

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createDate: Date;

    // @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
    // @Column({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
    @Column({ type: 'timestamp', nullable: true, })
    updateDate: Date;

    /** Quan hệ với User (người tạo tour) */
    @ManyToOne(() => UserEntity, (user) => user.tours, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    // 🔗 Relation với Image (1 tour có nhiều ảnh)
    @OneToMany(() => ImageEntity, (image) => image.tour)
    images: ImageEntity[];

    @OneToMany(() => TimelineEntity, (timeline) => timeline.tour)
    timelines: TimelineEntity[];

    @OneToMany(() => StartEndDateEntity, (startEndDate) => startEndDate.tour)
    startEndDates: StartEndDateEntity[];

    @OneToMany(() => BookingEntity, (booking) => booking.tour)
    bookings: BookingEntity[];

    @OneToMany(() => ReviewEntity, (review) => review.tour)
    reviewsComment: ReviewEntity[];

    @OneToMany(() => FavouriteEntity, (favourite) => favourite.tour)
    favourites: FavouriteEntity[];

    // Quan hệ OneToMany với bảng trung gian (nếu cần quản lý chi tiết)
    @OneToMany(() => TourHashtagEntity, (tourHashtag) => tourHashtag.tour)
    tourHashtags: TourHashtagEntity[];

    // /** Các quan hệ khác theo ảnh ERD */
    // @OneToMany(() => Booking, (booking) => booking.tour)
    // bookings: Booking[];

    // @OneToMany(() => Review, (review) => review.tour)
    // reviewsList: Review[];

    // @OneToMany(() => Favourite, (favourite) => favourite.tour)
    // favourites: Favourite[];

    // @OneToMany(() => Image, (image) => image.tour)
    // images: Image[];

    // @OneToMany(() => Timeline, (timeline) => timeline.tour)
    // timelines: Timeline[];

    // @OneToMany(() => StartEndDate, (date) => date.tour)
    // startEndDates: StartEndDate[];

    // @OneToMany(() => UserPromotion, (promotion) => promotion.tour)
    // promotions: UserPromotion[];




    /** Quan hệ 1-nhiều */
    //   @OneToMany(() => Image, (image) => image.tour)
    //   images: Image[];

    //   @OneToMany(() => Timeline, (timeline) => timeline.tour)
    //   timelines: Timeline[];

    //   @OneToMany(() => StartEndDate, (sed) => sed.tour)
    //   startEndDates: StartEndDate[];

    //   @OneToMany(() => Booking, (booking) => booking.tour)
    //   bookings: Booking[];

    //   @OneToMany(() => Review, (review) => review.tour)
    //   reviews: Review[];

    //   @OneToMany(() => Favourite, (fav) => fav.tour)
    //   favourites: Favourite[];
}
