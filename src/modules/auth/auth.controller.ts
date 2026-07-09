import { BadRequestException, Body, Controller, Get, Post, Req, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
// import { RegisterUserDto, LoginUserDto } from "../users/dto/user.dto";
// import { UsersService } from "../users/users.service";

import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UserService } from "../user/user.service";
import { CreateUserDto, RegisterUserDto } from "../user/dto/create-user.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ResponseData } from "src/global/globalClass";
import { UserEntity } from "../user/entities/user.entity";
import { HttpMessage, HttpStatus } from "src/global/globalEnum";

@ApiTags('auth')   // 👈 nhóm "auth"
@Controller("auth")
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        // private readonly userService: UsersService,
        private readonly userService: UserService,


    ) { }

    @Post("Register")
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Swap GER (có thể gửi JSON hoặc form-data)' })
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string', example: 'Nguyễn Văn A' },
                userName: { type: 'string', example: 'nguyenvana' },
                email: { type: 'string', example: 'example@gmail.com' },
                passWord: { type: 'string', example: '123456' },
                phoneNumber: { type: 'string', example: '0987654321' },
                address: { type: 'string', example: '123 Đường ABC, Quận 1' },
                birthDay: { type: 'date', example: '1998-12-30' },
                file: {
                    type: 'string',
                    format: 'binary', // 🔥 cái này bắt buộc để Swagger render nút "Choose File"
                    description: 'Ảnh đại diện upload',
                },
            },
        },
    })
    async register(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
        // Registration logic
        try {
            return new ResponseData<UserEntity>(await this.userService.create(createUserDto, file), HttpMessage.SUCCESS, HttpStatus.SUCCESS);
        } catch (error) {
            return new ResponseData<UserEntity>(null, error.message, HttpStatus.ERROR);
        }
    }

    // @Post("Login")
    // login(@Body() loginUserDto: LoginUserDto) {
    //     const { email, password } = loginUserDto;
    //     return this.userService.validateUser(email, password);
    // }

    @UseGuards(LocalAuthGuard)
    @Post("Login")
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'ironman@gmail.com' },
                password: { type: 'string', example: '123456' },
            },
        },
    })
    login(@Req() req) {
        // const { email, password } = loginUserDto;
        // console.log(req);
        return this.authService.login(req.user);
    }

    @Post('refresh-token')
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refreshToken: { type: 'string' },
            },
        },
    })
    async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
        if (!refreshToken) {
            return new BadRequestException('Refresh token is required');
        }
        const user = await this.authService.verifyRefreshToken(refreshToken);
        if (!user) {
            return new BadRequestException('Invalid refresh token');
        }
        return this.authService.login(user);

    }

    @ApiBearerAuth('bearerAuth')
    @Get('Profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req) {
        return req.user;
    }

    @Post('request-password-reset')
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'example@gmail.com' },
            },
        },
    })
    async requestPasswordReset(@Body('email') email: string) {
        return this.authService.requestPasswordReset(email);
    }

    @Post('reset-password')
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'example@gmail.com' },
                otp: { type: 'string', example: '123456' },
                newPassword: { type: 'string', example: '123456' },
            },
        },
    })
    async resetPassword(
        @Body('email') email: string,
        @Body('otp') otp: string,
        @Body('newPassword') newPassword: string
    ) {
        return this.authService.resetPassword(email, otp, newPassword);
    }

    @Post('request-verify-user-register-otp')
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'example@gmail.com' },
            },
        },
    })
    async requestVeryfyUserRegisterOtp(@Body('email') email: string) {
        return this.authService.requestVeryfyUserRegisterOtp(email);
    }

    @Post('verify-user-register-otp')
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'example@gmail.com' },
                otp: { type: 'string', example: '123456' },
            },
        },
    })
    async VerifyUserRegisterOtp(
        @Body('email') email: string,
        @Body('otp') otp: string
    ) {
        return this.authService.VerifyUserRegisterOtp(email, otp);
    }
}
