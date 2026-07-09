import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_coupons')
export class CouponEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    couponId: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    codeCoupon: string;

    @Column({ type: 'double' })
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
}