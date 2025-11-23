import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class LoginRequestDto {
	@ApiProperty({ example: "john_doe", description: "The username of the user" })
	@IsString()
	username: string;

	@ApiProperty({ example: "strongPassword123", description: "The password of the user" })
	@IsString()
	password: string;
}