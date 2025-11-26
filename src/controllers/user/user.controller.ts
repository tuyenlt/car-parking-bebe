import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginRequestDto } from "./dtos/login-request.dto";
import { UserService } from "./user.service";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { JWTGuard } from "src/common/guards/jwt.guard";
import { MessageResponseDto } from "src/common/dtos/message_reponse.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";


@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
	private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginRequestDto, @Req() req) {
	const { response, refreshCookie, accessCookie } = await this.userService.login(dto);
	req.res.setHeader('Set-Cookie', [refreshCookie, accessCookie]);
	return response;
  }

  @Post('login/by-plate')
  async loginByPlateNumber(@Body() dto : {plate_number : string}, @Req() req) {
	const { response, refreshCookie, accessCookie } = await this.userService.loginByPlateNumber(dto.plate_number);
	req.res.setHeader('Set-Cookie', [refreshCookie, accessCookie]);
	return response;
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto) {
	return this.userService.register(dto);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req) {
	const refreshToken = req.cookies['Refresh'];
	const { accessToken, cookie } = await this.userService.refreshToken(refreshToken);
	req.res.setHeader('Set-Cookie', cookie);
	return { accessToken };
  }

  @Get('is-authenticated')
  @UseGuards(JWTGuard)
  @ApiBearerAuth()
  async isAuthenticated(@Req() req) {
	return req.user;
  }

  	@Delete('logout')
	@UseGuards(JWTGuard)
	async logout(@Req() req) {
	const userId = req.user.id;

	req.res.setHeader('Set-Cookie', [
		`Authentication=; HttpOnly; Path=/; Max-Age=0`,
		`Refresh=; HttpOnly; Path=/; Max-Age=0`,
	]);

	return this.userService.logout(userId);
	}

}