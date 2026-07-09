import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum NotificationType {
    NHAN_TIEN = 'NHAN_TIEN',
    GUI_TIEN = 'GUI_TIEN',
    NAP_TIEN = 'NAP_TIEN',
    RUT_TIEN = 'RUT_TIEN',
    KHUYEN_MAI = 'KHUYEN_MAI',
}

@Entity('tbl_notifications')
export class NotificationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    body: string;

    // Lưu data phụ (JSON)
    @Column({ type: 'json', nullable: true })
    additionalData?: Record<string, any>;

    // Loại thông báo
    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    // Người gửi thông báo
    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'userFromId' })
    userFrom?: UserEntity;

    // Người nhận thông báo
    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userToId' })
    userTo: UserEntity;

    @Column({ default: false })
    isSeen: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
