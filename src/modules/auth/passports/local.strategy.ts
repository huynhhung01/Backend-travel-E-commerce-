import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { AuthService } from "../auth.service";
import { UserService } from "src/modules/user/user.service";
// import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly userService: UserService) {
        super({ usernameField: 'email' }); // specify that we are using 'email' instead of default 'username'
    }

    async validate(email: string, password: string): Promise<any> {
        const user = await this.userService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}