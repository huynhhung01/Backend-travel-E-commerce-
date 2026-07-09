import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateFcmDto {
    @ApiProperty({ example: 1, description: 'ID của user' })
    @Type(() => Number)   // ép kiểu chuỗi sang số
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        example: 'fcm_token_123456789',
        description: 'Firebase Cloud Messaging token của user',
    })
    @IsString()
    @IsNotEmpty()
    fcmToken: string;

    @IsString()
    // @IsNotEmpty()
    @Optional()
    oldFcmToken: string;
}
