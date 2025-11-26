import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { APP_ROLE } from "../constants/common.constant";


@Injectable()
export class RoleGuard implements CanActivate {
	constructor(
		private readonly allowedRoles: APP_ROLE[],
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if(!request.user){
			throw new ForbiddenException("Not login yet");
		}
		return this.allowedRoles.includes(request.user.role);
	}
}