import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "src/repositories/user.repository";
import { LoginRequestDto } from "./dtos/login-request.dto";
import * as bcrypt from 'bcrypt';
import { JWTService } from "src/services/jwt/jwt.service";
import { IJWTPayload } from "src/common/types/common.type";
import { LoginResponseDto } from "./dtos/login-response.dto";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { APP_ROLE, MemberShipRegisterType } from "src/common/constants/common.constant";
import { BillService } from "../bill/bill.service";
import { UserEntity } from "src/entities/user.entity";

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JWTService,
		private readonly billService: BillService,
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
			plate_number: user.plate_number,
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

	async loginByPlateNumber(plateNumber: string) {
		const user = await this.userRepository.findOneByFilter({ plate_number: plateNumber });
		if (user) {
			throw new BadRequestException("User with the given plate number already exists");
		}

		const payload: IJWTPayload = {
			id: 'plate-' + plateNumber,
			username: "Khách không đăng ký",
			plate_number: plateNumber,
			role: APP_ROLE.GUEST,
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
		response.user = {
			id: payload.id,
			username: payload.username,
			role: payload.role,
		};


		const accessCookie = this.generateAccessCookie(accessToken);
		const refreshCookie = this.generateRefreshCookie(refreshToken);
		return { response, refreshCookie , accessCookie};
	}

	async refreshToken(refreshToken: string) {
		const payload = this.jwtService.verifyRefreshToken(refreshToken);
		if (!payload) {
			throw new BadRequestException("Invalid refresh token");
		}

		const newPayload = payload.role === APP_ROLE.ADMIN 
			? await this.generateNewAdminPayload(payload) 
			: {
				id: payload.id,
				username: payload.username,
				role: payload.role,
				plate_number: payload.plate_number || null,
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

	async logout(userId: string) {
		return this.userRepository.updateBy({ id: userId }, { refresh_token: null });
	}

	async register(dto: RegisterRequestDto) {
		const existingUser = await this.userRepository.findOneByFilter({ username: dto.username });
		if (existingUser) {
			throw new BadRequestException("Username already exists");
		}

		const hashedPassword = await this.hashPassword(dto.password);

		// Create entity instance to trigger @BeforeInsert hook
		const newUser = new UserEntity();
		newUser.username = dto.username;
		newUser.password = hashedPassword;
		newUser.role = APP_ROLE.USER;
		newUser.plate_number = dto.plate_number;

		await this.userRepository.create(newUser); 

		return {
			message: "User registered successfully",
		}
	}

	async getUserByPlateNumber(plateNumber: string) {
		return this.userRepository.findOneByFilter({ plate_number: plateNumber });
	}

	async checkUserMembership(plateNumber: string): Promise<boolean> {
		const user = await this.getUserByPlateNumber(plateNumber);
		if (!user) {
			return false;
		}
		const currentDate = new Date();
		if (user.start_date && user.end_date) {
			return currentDate >= user.start_date && currentDate <= user.end_date;
		}
		return false;
	}

	async createMembership(plateNumber: string, membershipType: MemberShipRegisterType): Promise<any> {
		const user = await this.getUserByPlateNumber(plateNumber);
		const { startDate, endDate, amount } = await this.getRegisterInfoForMemberShipRegister(membershipType);
		if (!user) {
			throw new BadRequestException("User with the given plate number does not exist");
		}
		user.start_date = startDate;
		user.end_date = endDate;
		await this.userRepository.update(user.id, user);
		const bill = await this.billService.createBillForUserMembershipPayment(user, amount);
		return bill;
	}

	async getMembershipInfo(plateNumber: string): Promise<any> {
		const user = await this.getUserByPlateNumber(plateNumber);
		if (!user) {
			throw new BadRequestException("User with the given plate number does not exist");
		}
		const bill = await this.billService.getLatestMembershipBillForUser(user.id);
		if(bill)
		 return {
			start_date: user.start_date,
			end_date: user.end_date,
			is_membership_paid: user.is_membership_paid,
			bill: bill,
		};
		return null;
	}

	private async getRegisterInfoForMemberShipRegister(membershipType: MemberShipRegisterType) {
		const startDate = new Date();
		const endDate = new Date();
		let amount = 0;
		switch (membershipType) {
			case MemberShipRegisterType.MONTH_1:
				endDate.setMonth(endDate.getMonth() + 1);
				amount = 500000;
				break;
			case MemberShipRegisterType.MONTH_3:
				endDate.setMonth(endDate.getMonth() + 3);
				amount = 1400000;
				break;
			case MemberShipRegisterType.MONTH_6:
				endDate.setMonth(endDate.getMonth() + 6);
				amount = 2700000;
				break;
			case MemberShipRegisterType.MONTH_12:
				endDate.setFullYear(endDate.getFullYear() + 1);
				amount = 5000000;
				break;
			default:
				throw new BadRequestException("Invalid membership type");
		}
		return { startDate, endDate, amount };
	}

	private async generateNewAdminPayload(oldPayload : any): Promise<IJWTPayload> {
		const user = await this.userRepository.findOneByFilter({ id: oldPayload.id });
		if (!user) {
			throw new BadRequestException("User not found");
		}
		return {
			id: user.id,
			username: user.username,
			role: user.role,
		};
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