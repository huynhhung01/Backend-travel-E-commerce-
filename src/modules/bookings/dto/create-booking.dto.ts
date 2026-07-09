import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELED = 'canceled',
    PAID = 'paid',
}

export class CreateBookingDto {
    @ApiProperty({ description: 'ID tour được đặt', example: 3 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number; // FK -> Tour

    @ApiProperty({ description: 'ID người dùng đặt tour', example: 6 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number; // FK -> User

    @ApiProperty({ description: 'ID ngày khởi hành (Start_End_Date)', example: 55 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    dateId: number; // FK -> Start_End_Date

    @ApiProperty({ description: 'Họ và tên người đặt', example: 'Nguyễn Văn A' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ description: 'Email người đặt', example: 'example@gmail.com' })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Số điện thoại liên hệ', example: '0987654321' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ description: 'Địa chỉ liên hệ (nếu có)', example: '123 Đường ABC, Quận 1', required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'Số lượng người lớn', example: 2, minimum: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @Min(1)
    numAdults: number;

    @ApiProperty({ description: 'Số lượng trẻ em (nếu có)', example: 1, minimum: 0, required: false })
    @IsOptional()
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @Min(0)
    numChildren?: number;

    @ApiProperty({ description: 'Tổng giá trị booking', example: 3000000 })
    @IsOptional()
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @Min(0)
    totalPrice?: number;

    @ApiProperty({ description: 'Mã coupon để áp dụng giảm giá', example: 'SUMMER2025' })
    @IsString()
    @IsOptional()
    // @IsNotEmpty()
    codeCoupon?: string;

    @ApiProperty({ description: 'Trạng thái booking', enum: BookingStatus, example: BookingStatus.PENDING })
    @IsEnum(BookingStatus)
    bookingStatus: BookingStatus;

    @ApiProperty({ description: 'Có nhận email xác nhận không', example: true, required: false })
    @IsOptional()
    @IsBoolean()
    receiveEmail?: boolean;
}
