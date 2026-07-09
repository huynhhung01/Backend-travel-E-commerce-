import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { AccountStatus } from "../entities/account.entity";

export class CreateAccountDto {
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number; // id người dùng liên kết với account

    @IsString()
    @IsNotEmpty()
    accountNumber: string;

    @IsString()
    @IsNotEmpty()
    accountName: string;

    @IsString()
    @IsNotEmpty()
    bankName: string;

    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsOptional()
    @Min(0)
    balance?: number; // mặc định 0 nếu không truyền

    @IsOptional()
    @IsEnum(AccountStatus)
    status?: AccountStatus; // active, frozen, closed
}
