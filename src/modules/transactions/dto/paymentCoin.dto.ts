import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export enum PaymentType {
    NAP = 'NAP_TIEN', // Nạp tiền
    RUT = 'RUT_TIEN', // Rút tiền
}

export class PaymentCoinDto {

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userWalletAccountId: number;

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    type: PaymentType; // NAP_TIEN, RUT_TIEN
}