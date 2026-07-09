import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
// import { UsersModule } from "../users/users.module";

import { TypeOrmModule } from "@nestjs/typeorm";
// import { UserEntity } from "../users/entities/users.entity";
import { PassportModule } from "@nestjs/passport/dist/passport.module";
import { JwtModule } from "@nestjs/jwt/dist/jwt.module";
import { LocalStrategy } from "./passports/local.strategy";
import { JwtStrategy } from "./passports/jwt.strategy";
import { UserEntity } from "../user/entities/user.entity";
import { UserModule } from "../user/user.module";
import { RefreshTokensModule } from "../refresh_tokens/refresh_tokens.module";
import { MailModule } from "../mail/mail.module";
import { RedisModule } from "../redis/redis.module";


@Module({
    imports: [
        // UsersModule,
        UserModule,
        RefreshTokensModule,
        MailModule,
        RedisModule,
        TypeOrmModule.forFeature([UserEntity]),
        PassportModule,
        JwtModule.register({
            secret: "jwt_secret_key",
            signOptions: { expiresIn: "1h" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {

}