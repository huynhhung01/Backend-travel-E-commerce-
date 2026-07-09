import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCouponDto {
    @ApiProperty({ description: 'Tiêu đề coupon', example: 'Khuyến mãi mùa hè' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Mã coupon để áp dụng giảm giá', example: 'SUMMER2025' })
    @IsString()
    @IsNotEmpty()
    codeCoupon: string;

    @ApiProperty({ description: 'Phần trăm giảm giá (0 - 100)', example: 20 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    discount: number;

    @ApiProperty({ description: 'Ngày bắt đầu áp dụng', example: '2025-07-01' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({ description: 'Ngày kết thúc áp dụng', example: '2025-07-31' })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    endDate: Date;

    // @ApiProperty({ description: 'Trạng thái coupon (y = hoạt động, n = không hoạt động)', example: 'y', default: 'y' })
    @IsString()
    @IsOptional()
    @IsIn(['y', 'n'])
    status?: string = 'y';
}
