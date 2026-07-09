import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty } from "class-validator";

export class CancelBookingDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    bookingId: number;

    @Type(() => Boolean)
    @IsBoolean()
    SupplierCancel: boolean = false;
}
