import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateFavouriteDto {
    @ApiProperty({ description: 'ID user thực hiện thao tác yêu thích', example: 101, required: true })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ description: 'ID tour được thêm vào danh sách yêu thích', example: 12, required: true })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number;

    // @ApiProperty({ description: 'Trạng thái yêu thích (1 = yêu thích, 0 = bỏ thích)', example: 1, required: false, default: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    // @IsNotEmpty()
    @IsOptional()
    // @IsNumber()
    statusFavourite?: number; // default 1 (yêu thích)
}
