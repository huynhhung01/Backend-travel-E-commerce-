import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateTransactionDto {

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    // @IsNotEmpty()
    paymentId?: number;

    // @IsOptional()
    // @IsDateString()
    // transaction_date?: string; // ISO format: '2025-10-21T00:00:00Z'

    @IsOptional()
    @IsString()
    account_number?: string;

    @IsOptional()
    @IsString()
    sub_account?: string;

    // @Type(() => Number)   // ép kiểu chuỗi sang số
    // @IsInt()
    // @Min(0)
    // amount_in?: number;

    // @Type(() => Number)   // ép kiểu chuỗi sang số
    // @IsInt()
    // @Min(0)
    // amount_out?: number;

    // @Type(() => Number)   // ép kiểu chuỗi sang số
    // @IsInt()
    // @Min(0)
    // accumulated?: number;

    @IsOptional()
    @IsString()
    code?: string;

    // @IsOptional()
    @IsString()
    @IsNotEmpty()
    transaction_content?: string;

    @IsOptional()
    @IsString()
    reference_number?: string;

    // @IsOptional()
    // @IsString()
    // body?: string;

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    booking_id?: number;
}
