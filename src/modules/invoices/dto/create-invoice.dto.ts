import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";

export class CreateInvoiceDto {
    @ApiProperty({ description: 'ID của booking liên kết với hóa đơn', example: 123 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    bookingId: number;

    @ApiProperty({ description: 'Tổng số tiền của hóa đơn (>= 0)', minimum: 0, example: 5000000 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    amount: number;

    // @ApiPropertyOptional({ description: 'Ngày phát hành hóa đơn', example: '2025-09-25T10:00:00.000Z' })
    @IsNotEmpty()
    @IsOptional()
    @IsDateString()
    dateIssued: Date;
}
