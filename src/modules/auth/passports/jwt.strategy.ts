import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { UserService } from "src/modules/user/user.service";
// import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'jwt_secret_key'
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
        // return { id_user: payload.id_user, email: payload.email };
    }
}