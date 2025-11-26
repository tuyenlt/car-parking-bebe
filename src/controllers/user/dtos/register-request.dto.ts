import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class RegisterRequestDto {
	@ApiProperty({ example: "john_doe", description: "The username of the user" })
	@IsString()
	username: string;

	@ApiProperty({ example: "strongPassword123", description: "The password of the user" })
	@IsString()
	password: string;

	@ApiProperty({ example: "ABC-1234", description: "The plate number of the user" })
	@IsString()
	plate_number: string;
}