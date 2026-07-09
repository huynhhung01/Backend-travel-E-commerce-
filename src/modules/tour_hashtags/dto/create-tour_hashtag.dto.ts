import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateTourHashtagDto {
    @ApiProperty({ description: 'ID tour tạo tour_hashtag', example: 6 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    tourId: number;

    @ApiProperty({ description: 'ID hashtag  tạo tour_hashtag', example: 1 })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    hashtagId: number;
}
