import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, isString, Max, Min } from "class-validator";
// import { IsString } from "class-validator/types/decorator/typechecker/IsString";

export class CreateReviewDto {
    @ApiProperty({ description: 'ID tour được đánh giá', example: 12 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number;   // FK tới tour

    @ApiProperty({ description: 'ID user thực hiện đánh giá', example: 6 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number;   // FK tới user

    @ApiProperty({ description: 'Số sao đánh giá (1 - 5)', minimum: 1, maximum: 5, example: 4 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @Min(1)
    @Max(5)
    rating: number;   // số sao từ 1 - 5

    @ApiPropertyOptional({ description: 'Nội dung đánh giá (không bắt buộc)', example: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình' })
    @IsString()
    @IsOptional()
    comment?: string; // nội dung đánh giá
}
