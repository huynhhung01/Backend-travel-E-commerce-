import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty, Min } from "class-validator";

export class CreateStartEndDateDto {
    @ApiProperty({ description: 'ID tour liên kết', example: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number; // liên kết với tour

    @ApiProperty({ description: 'Ngày bắt đầu tour (YYYY-MM-DD)', example: '2025-10-01' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({ description: 'Ngày kết thúc tour (YYYY-MM-DD)', example: '2025-10-07' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    endDate: Date;

    @ApiProperty({ description: 'Giá vé người lớn', example: 2500000 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    priceAdult: number; // gia người lớn

    @ApiProperty({ description: 'Giá vé trẻ em', example: 1500000 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    priceChildren: number; // giá trẻ em

    @ApiProperty({ description: 'Số lượng khả dụng', example: 30 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    quantity: number; // số lượng khả dụng

    @ApiProperty({ description: 'Tình trạng chỗ: 1 = còn chỗ, 0 = hết chỗ', example: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    // @IsNotEmpty()
    availability: number; // 1 = còn chỗ, 0 = hết chỗ
}
