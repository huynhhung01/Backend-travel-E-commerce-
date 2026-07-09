import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class PaymentDto {
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    bookingId: number;

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number;
}