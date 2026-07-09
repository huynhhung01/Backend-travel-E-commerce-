import { UserEntity } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_fcm')
export class FcmEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'userId' })
    // // @Index({ unique: true })
    // user: UserEntity;


    @OneToOne(() => UserEntity, (user) => user.fcm, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    fcmToken: string;

}
