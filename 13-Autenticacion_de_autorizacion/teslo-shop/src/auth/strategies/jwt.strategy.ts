import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";

export class JwtStrategy extends PassportStrategy( Strategy ) {
    async validate ( payload: IJwtPayload ): Promise<User> {
        const { email } = payload;
        return;
    }
}