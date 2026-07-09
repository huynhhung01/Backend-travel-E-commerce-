import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export enum PaymentMethod {
    CASH = 'CASH',
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
    BANKING = 'BANKING',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export class CreateCheckoutDto {
    @ApiProperty({ description: 'ID booking liên kết', example: 3 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    bookingId: number; // FK đến booking

    @ApiProperty({ description: 'Phương thức thanh toán', enum: PaymentMethod, example: PaymentMethod.MOMO })
    @IsString()
    @IsNotEmpty()
    paymentMethod: PaymentMethod; // phương thức thanh toán (VD: MOMO, VNPAY, CASH)

    @ApiProperty({ description: 'Ngày thanh toán (ISO format)', example: '2025-09-25T10:30:00Z', required: false })
    @IsDateString()
    @IsOptional()
    // @IsNotEmpty()
    paymentDate: string; // ngày thanh toán

    @ApiProperty({ description: 'Số tiền thanh toán', example: 1500000, minimum: 0 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    amount: number; // số tiền thanh toán

    @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus, example: PaymentStatus.PENDING })
    @IsString()
    @IsNotEmpty()
    paymentStatus: PaymentStatus; // trạng thái (PENDING, SUCCESS, FAILED)

    @ApiProperty({ description: 'Mã giao dịch từ cổng thanh toán', example: 'TXN123456789', required: false })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    transactionId: string; // mã giao dịch từ cổng thanh toán
}
