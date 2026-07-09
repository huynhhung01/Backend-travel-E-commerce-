import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { TransactionStatus, TransactionType } from "../entities/transactions-coin.entity";

export class CreateTransactionsCoinDto {
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    fromAccount?: number; // tài khoản gửi (nullable nếu là nạp tiền)

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    toAccount?: number; // tài khoản nhận (nullable nếu là rút tiền)

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    amount: number;

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsOptional()
    // @IsNotEmpty()
    bookingId?: number;

    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType; // NAP, RUT, THANH_TOAN, HOAN_TIEN

    @IsOptional()
    @IsEnum(TransactionStatus)
    status?: TransactionStatus; // mặc định là PENDING

    @IsOptional()
    @IsString()
    description?: string;
}
