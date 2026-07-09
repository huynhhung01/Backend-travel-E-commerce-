import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateHashtagDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên hashtag không được để trống' })
    @MaxLength(100, { message: 'Tên hashtag không được vượt quá 100 ký tự' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
