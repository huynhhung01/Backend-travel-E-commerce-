import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { NotificationType } from "../entities/notification.entity";
import { Type } from "class-transformer";

export class CreateNotificationDto {
    @ApiProperty({ example: 'Bạn vừa nhận được tiền', description: 'Tiêu đề thông báo' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'Bạn vừa nhận được 200.000đ từ Nguyễn Văn A',
        description: 'Nội dung chi tiết thông báo',
    })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({
        example: { amount: 200000, transactionId: 'TX12345' },
        description: 'Dữ liệu bổ sung (JSON)',
        required: false,
    })
    @IsOptional()
    @IsObject()
    additionalData?: Record<string, any>;

    @ApiProperty({
        example: NotificationType.NHAN_TIEN,
        enum: NotificationType,
        description: 'Loại thông báo',
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        example: 1,
        description: 'ID của user gửi',
        required: false,
    })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    // @IsOptional()
    @IsNotEmpty()
    userFromId: number;

    @ApiProperty({ example: 2, description: 'ID của user nhận thông báo' })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userToId: number;

    @ApiProperty({ example: false, description: 'Đánh dấu đã đọc hay chưa' })
    @IsOptional()
    @IsBoolean()
    isSeen?: boolean;

}
