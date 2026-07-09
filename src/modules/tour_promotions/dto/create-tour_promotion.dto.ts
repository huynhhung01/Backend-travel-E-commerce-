import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateTourPromotionDto {
    @ApiProperty({ description: 'ID user (supplier) tạo tour', example: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    promotionId: number; // FK -> Promotion

    @ApiProperty({ description: 'ID ngày bắt đầu/kết thúc tour', example: 5 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    dateId: number; // FK -> StartEndDate
}
