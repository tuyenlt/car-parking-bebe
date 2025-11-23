import { Module } from "@nestjs/common";
import { JWTService } from "./jwt.service";
import { JwtModule as NestJwtModule } from "@nestjs/jwt";


@Module({
	imports: [
		NestJwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	providers: [JWTService],
	exports: [JWTService],
})
export class JwtModule {}