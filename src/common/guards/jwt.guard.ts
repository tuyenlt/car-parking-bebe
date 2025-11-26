import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JWTService } from "src/services/jwt/jwt.service";


@Injectable()
export class JWTGuard implements CanActivate {
	constructor(
		private readonly jwtService: JWTService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers['authorization'];
		if (!authHeader) {
			throw new UnauthorizedException('Authorization header not found');
		}

		const token = authHeader.split(' ')[1];
		const payload = this.jwtService.verifyAccessToken(token);
		if (!payload) {
			throw new UnauthorizedException('Invalid or expired token');
		}
		request.user = payload;
		return true;
	}
}