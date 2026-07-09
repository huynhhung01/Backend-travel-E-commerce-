import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateImageDto {
    @ApiProperty({ description: 'ID tour liên kết với ảnh', example: 3 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number; // liên kết với tour

    // @ApiProperty({ description: 'Đường dẫn ảnh minh họa', example: 'https://example.com/images/tour1.jpg', required: false })
    @IsString()
    // @IsNotEmpty()
    @IsOptional()
    imageURL: string; // đường dẫn ảnh

    @ApiPropertyOptional({ description: 'Mô tả cho ảnh (không bắt buộc)', example: 'Hình chụp toàn cảnh vịnh Hạ Long', required: false })
    @IsString()
    @IsOptional()
    description?: string; // mô tả ảnh (nếu có)
}
