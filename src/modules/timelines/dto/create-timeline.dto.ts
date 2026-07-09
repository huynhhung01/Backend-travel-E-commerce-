import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTimelineDto {
    @ApiProperty({ description: 'ID  tour', example: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number; // Liên kết với tour

    @ApiProperty({ description: 'Tiêu đề timeline', example: 'Ngày 1 - Khởi hành' })
    @IsString()
    @IsNotEmpty()
    tl_title: string; // Tiêu đề timeline (VD: "Ngày 1 - Khởi hành")

    @ApiProperty({ description: 'tên địa danh', example: 'Ngũ hành sơn' })
    @IsString()
    // @IsNotEmpty()
    @IsOptional()
    tl_placeName: string;


    @ApiProperty({ description: 'Mô tả chi tiết hoạt động trong ngày', example: 'Buổi sáng: Khởi hành từ TP.HCM đến Đà Lạt...' })
    @IsString()
    @IsNotEmpty()
    tl_description: string; // Mô tả chi tiết hoạt động trong ngày

    @IsOptional()
    @IsString()
    imageTimeLine?: string;

}
