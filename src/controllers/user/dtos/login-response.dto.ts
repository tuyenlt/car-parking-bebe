import { ApiProperty } from "@nestjs/swagger";
import type { IUserM } from "src/common/types/common.type";



export class LoginResponseDto {
	@ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description: "The access token for the user" })
	accessToken: string;

	@ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description: "The refresh token for the user" })
	refreshToken: string;

	@ApiProperty({ description: "The user information" })
	user: IUserM;

}