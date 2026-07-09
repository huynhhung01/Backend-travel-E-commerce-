import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
// import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { RefreshTokensService } from "../refresh_tokens/refresh_tokens.service";
import { MailService } from "../mail/mail.service";
import { RedisService } from "../redis/redis.service";

@Injectable()

export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly refreshTokensService: RefreshTokensService,
        private readonly mailService: MailService,
        private readonly redisService: RedisService,
    ) { }

    async login(user: any) {
        const payload = { userId: user.userId, email: user.email };
        const refresh_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecretKey',
            expiresIn: '7d'
        });

        console.log(user.userId);

        this.refreshTokensService.createRefreshToken(refresh_token, user.userId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refresh_token,
        };
    }

    async verifyRefreshToken(refreshToken: string) {
        const decoded = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecretKey',
        });
        if (decoded) {
            // throw new UnauthorizedException('Invalid refresh token');
            // console.log("decode " + decoded.userId);
            // kiểm tra token có trong db và hợp lệ không
            const user = await this.refreshTokensService.verryRefreshToken(refreshToken, decoded.userId);
            // console.log("verifyRefreshToken");
            console.log(user);
            if (user) {
                return user;
            }
        }
        return false;
    }

    async requestPasswordReset(email: string) {
        // Kiểm tra user tồn tại
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new BadRequestException('email not found');
        }
        // Tạo OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Lưu OTP vào redis với TTL 5 phút
        await this.redisService.set(`otp:${email}`, otp, 300);
        // Gửi mail
        await this.mailService.sendOtpMail(email, otp);
        return { message: 'OTP sent to email' };
    }

    async resetPassword(email: string, otp: string, newPassword: string) {
        // Lấy OTP từ redis

        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new BadRequestException('email not found');
        }

        const savedOtp = await this.redisService.get(`otp:${email}`);

        console.log(email, otp, newPassword);
        console.log('Saved OTP:', savedOtp);
        if (!savedOtp || savedOtp !== otp) {
            throw new BadRequestException('Invalid or expired OTP');
        }
        // Đổi mật khẩu
        await this.userService.updatePassword(email, newPassword);
        // Xóa OTP khỏi redis
        await this.redisService.del(`otp:${email}`);
        return { message: 'Password reset successful' };
    }

    async requestVeryfyUserRegisterOtp(email: string) {
        // Kiểm tra user tồn tại
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new BadRequestException('email not found');
        }
        // Tạo OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Lưu OTP vào redis với TTL 5 phút
        await this.redisService.set(`otp:${email}`, otp, 300);
        // Gửi mail
        await this.mailService.sendOtpMail(email, otp);
        return { message: 'OTP sent to email for verification user registration' };
    }

    async VerifyUserRegisterOtp(email: string, otp: string) {
        // Lấy OTP từ redis

        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new BadRequestException('email not found');
        }

        const savedOtp = await this.redisService.get(`otp:${email}`);

        console.log(email, otp);
        console.log('Saved OTP:', savedOtp);
        if (!savedOtp || savedOtp !== otp) {
            throw new BadRequestException('Invalid or expired OTP');
        }
        // Đổi trạng thái kích hoạt
        await this.userService.updateActive(email);
        // Xóa OTP khỏi redis
        await this.redisService.del(`otp:${email}`);
        return { message: 'User registration successful' };
    }
}
