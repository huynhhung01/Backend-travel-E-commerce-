import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên người dùng' })
    @IsString()
    @IsNotEmpty({ message: 'Full name should not be empty' })
    fullName: string;

    @ApiProperty({ example: 'nguyenvana', description: 'Tên đăng nhập (unique)' })
    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'User name should not be empty' })
    userName?: string;

    @ApiProperty({ example: 'example@gmail.com', description: 'Email hợp lệ và duy nhất' })
    @IsString()
    @IsEmail()
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @ApiProperty({ example: '123456', description: 'Mật khẩu, ít nhất 6 ký tự' })
    @IsString()
    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(6)
    passWord: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiPropertyOptional({ example: '123 Đường ABC, Quận 1, TP.HCM', description: 'Địa chỉ (optional)' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: '1998-12-30', description: 'Ngày sinh (YYYY-MM-DD)', type: String })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthDay?: Date;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.USER; // admin | user | supplier

    @IsOptional()
    @IsString()
    isActive?: string = "n";

    @ApiProperty({ example: '21.0285', description: 'Vĩ độ (latitude)' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    // @IsNotEmpty({ message: 'User name should not be empty' })
    latitude?: number;

    @ApiProperty({ example: '105.8542', description: 'Kinh độ (longitude)' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    // @IsNotEmpty({ message: 'User name should not be empty' })
    longitude?: number;
}

export class RegisterUserDto {
    // @IsNotEmpty({ message: 'User name should not be empty' })
    userName: string;

    @IsNotEmpty({ message: 'Password should not be empty' })
    passWord: string;

    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @IsNotEmpty({ message: 'Full name should not be empty' })
    fullName: string;

    // @IsNotEmpty({ message: 'Gender should not be empty' })
    // gender: string;

    @IsNotEmpty({ message: 'Phone number should not be empty' })
    phoneNumber: string;

    @IsNotEmpty({ message: 'Address should not be empty' })
    address: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthDay?: Date;
}

export class LoginUserDto {
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @IsNotEmpty({ message: 'Password should not be empty' })
    passWord: string;
}
