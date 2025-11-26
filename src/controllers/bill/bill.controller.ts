import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { BillService } from "./bill.service";
import { JWTGuard } from "src/common/guards/jwt.guard";
import { BillType } from "src/common/constants/common.constant";


@Controller("bill")
@UseGuards(JWTGuard)
export class BillController {
	constructor(
		private readonly billService: BillService,
	){}

	@Get("/test/vnpay")
	async testVNPAY() {
		const vnpayUrl = await this.billService.createVNPAYBill(500000, 'TEST123456d', BillType.TEMPORARY);
		return { vnpayUrl };
	}

	@Get("/vnpay-return")
	async handleVNPAYReturn(@Query() queryParams: any) {
		const result = await this.billService.handleReturnVNPAY(queryParams);
		return result;
	}
}