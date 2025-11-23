import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "src/repositories/user.repository";
import { LoginRequestDto } from "./dtos/login-request.dto";
import * as bcrypt from 'bcrypt';
import { JWTService } from "src/services/jwt/jwt.service";
import { IJWTPayload } from "src/common/types/common.type";
import { LoginResponseDto } from "./dtos/login-response.dto";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { APP_ROLE } from "src/common/constants/common.constant";

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JWTService,
	) {}

	async login(dto : LoginRequestDto) {
		const user = await this.userRepository.findOneByFilter({ username: dto.username});
		if (!user) {
			throw new BadRequestException("User not found");
		}

		const isPasswordValid = await bcrypt.compare(dto.password, user.password);
		if (!isPasswordValid) {
			throw new BadRequestException("Invalid password");
		}

		const payload : IJWTPayload = {
			id: user.id,
			username: user.username,
			role: user.role,
		};

		const accessToken = this.jwtService.signToken(
			payload,
			process.env.JWT_SECRET || 'secret_key',
			process.env.JWT_EXPIRATION_TIME || '1h',
		);

		const refreshToken = this.jwtService.signToken(
			payload,
			process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret_key',
			process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '7d',
		);

		const response = new LoginResponseDto();

		response.accessToken = accessToken;
		response.refreshToken = refreshToken;
		response.user = {
			id: user.id,
			username: user.username,
			role: user.role,
		};

		const refreshCookie = this.generateRefreshCookie(refreshToken);
		const accessCookie = this.generateAccessCookie(accessToken);

		return { response, refreshCookie , accessCookie};
	}

	async register(dto: RegisterRequestDto){
		const existingUser = await this.userRepository.findOneByFilter({ username: dto.username });
		if (existingUser) {
			throw new BadRequestException("Username already exists");
		}

		const hashedPassword = await this.hashPassword(dto.password);

		const newUser = await this.userRepository.create({
			username: dto.username,
			password: hashedPassword,
			role: APP_ROLE.USER,
		});

		return {
			id: newUser.id,
			username: newUser.username,
			role: newUser.role,
		};
	}

	async refreshToken(refreshToken: string) {
		const payload = this.jwtService.verifyRefreshToken(refreshToken);
		if (!payload) {
			throw new BadRequestException("Invalid refresh token");
		}

		const user = await this.userRepository.findOneByFilter({ id: payload.id });
		if (!user || user.refresh_token !== refreshToken) {
			throw new BadRequestException("Invalid refresh token");
		}

		const newPayload : IJWTPayload = {
				id: user.id,
				username: user.username,
				role: user.role,
			}

		const newAccessToken = this.jwtService.signToken(
			newPayload,
			process.env.JWT_SECRET || 'secret_key',
			process.env.JWT_EXPIRATION_TIME || '1h',
		);

		const newRefreshToken = this.jwtService.signToken(
			newPayload,
			process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret_key',
			process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '7d',
		);


		const cookie = this.generateRefreshCookie(newRefreshToken);

		return { accessToken: newAccessToken , cookie};
	}

	private generateAccessCookie(token: string): string {
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME || 60 * 60}`;
	}

	private generateRefreshCookie(token: string): string {
		return `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || 7 * 24 * 60 * 60}`;
	}

	private async hashPassword(password: string): Promise<string> {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		return hashedPassword;
	}
}