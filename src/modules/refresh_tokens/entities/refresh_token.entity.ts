import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('tbl_refresh_token')
export class RefreshTokenEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    refreshToken: string;

    @Column()
    expiresAt: Date;

    // @CreateDateColumn({ type: 'timestamp', })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
