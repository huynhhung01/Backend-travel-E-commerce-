import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreatePromotionDto {
    @ApiProperty({ description: 'Mô tả chương trình khuyến mãi', example: 'Giảm giá mùa hè cho tất cả các tour' })
    @IsString()
    // @IsOptional()
    @IsNotEmpty()
    description?: string;

    @ApiProperty({ description: 'Phần trăm giảm giá (0 - 100)', minimum: 0, maximum: 100, example: 20 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    discount: number;

    @ApiProperty({ description: 'Ngày bắt đầu khuyến mãi', example: '2025-10-01T00:00:00.000Z' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({ description: 'Ngày kết thúc khuyến mãi', example: '2025-12-31T23:59:59.000Z' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    endDate: Date;

    @ApiPropertyOptional({ description: 'Trạng thái khuyến mãi (y = còn hiệu lực, n = không hiệu lực)', enum: ['y', 'n'], example: 'y', default: 'y' })
    @IsString()
    @IsOptional()
    @IsIn(['y', 'n'])
    status?: string = 'y';
}
