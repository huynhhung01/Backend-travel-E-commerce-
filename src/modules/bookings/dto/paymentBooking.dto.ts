import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PaymentBookingDto {
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    bookingId: number;
    // paymentMethod: string;
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    amount: number;

    @IsOptional()
    @IsString()
    decription?: string;

}