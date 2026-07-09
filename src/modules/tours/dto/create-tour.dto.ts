import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTourDto {
    @ApiProperty({ description: 'Tiêu đề tour', example: 'Tour Đà Lạt 3 ngày 2 đêm' })
    @IsString()
    @IsNotEmpty()
    title: string; // tieu de tour

    @IsString()
    @IsOptional()
    slug?: string; // duong dan seo

    @ApiPropertyOptional({ description: 'Mô tả chi tiết về tour', example: 'Tham quan Langbiang, Hồ Xuân Hương...' })
    @IsString()
    @IsOptional()
    description?: string; // mo ta chi tiet ve tour : nhung diem noi bat, trai nghiem

    @IsString()
    @IsOptional()
    image?: string; // 

    @ApiPropertyOptional({ description: 'Điểm đến chính của tour', example: 'Đà Lạt' })
    @IsString()
    @IsOptional()
    destination?: string; // diem den chinh cua tour

    @ApiPropertyOptional({ description: 'Lịch trình tổng quát', example: 'Ngày 1: ... Ngày 2: ...' })
    @IsString()
    @IsOptional()
    highlight?: string; // noi bat cua tour

    @ApiPropertyOptional({ description: 'Thời gian tour', example: '3 ngày 2 đêm' })
    @IsString()
    @IsOptional()
    time?: string; // thoi gian tour

    @ApiPropertyOptional({ description: 'Đánh giá tổng quát', example: 'Rất đáng trải nghiệm' })
    @IsString()
    @IsOptional()
    reviews?: string;

    @ApiPropertyOptional({ description: 'Vùng miền tổ chức tour', example: 'Miền Trung' })
    @IsString()
    @IsOptional()
    domain?: string; // vung mien to chuc tour 

    /** Trường mới */
    @ApiProperty({ description: 'Số lượng khách tối đa', example: 20 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    quantity: number;

    @ApiPropertyOptional({ description: 'Số khách đã hoàn thành tour', example: 5 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsOptional()
    countComplete?: number;

    @ApiPropertyOptional({ description: 'Địa chỉ cụ thể (map)', example: '01 Trần Hưng Đạo, Đà Lạt' })
    @IsString()
    @IsOptional()
    address?: string; // dia chi map cua tour

    @ApiPropertyOptional({ description: 'Trạng thái tour', example: 'active' })
    @IsString()
    @IsOptional()
    status?: string; // trang thai tour

    /** User tạo tour */
    @ApiProperty({ description: 'ID user (supplier) tạo tour', example: 101 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number; // id nguoi supplier tao tour
}
