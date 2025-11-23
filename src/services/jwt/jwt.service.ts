import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"
import { IJWTPayload } from "src/common/types/common.type";

@Injectable()
export class JWTService {
	constructor(
		private readonly jwtService: JwtService,
	) {}

	signToken(payload: IJWTPayload, secret: string, expiresIn: string): string {
		return this.jwtService.sign(payload, { secret, expiresIn: Number(expiresIn) });
	}

	verifyAccessToken(token: string): any {
		try {
			return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
		} catch (error) {
			return null;
		}
	}

	verifyRefreshToken(token: string): any {
		try {
			return this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_TOKEN_SECRET });
		} catch (error) {
			return null;
		}
	}
}
