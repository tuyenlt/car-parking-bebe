import { Controller, Get, Post, Query } from "@nestjs/common";
import { BillService } from "./bill.service";


@Controller("bill")
export class BillController {
	constructor(
		private readonly billService: BillService,
	){}

	@Get("/test/vnpay")
	async testVNPAY() {
		const vnpayUrl = await this.billService.createVNPAYBill(500000, 'TEST123456d');
		return { vnpayUrl };
	}

	@Get("/vnpay-return") 
	async handleVNPAYReturn(@Query() queryParams: any) {
		const result = await this.billService.handleReturnVNPAY(queryParams);
		return result;
	}
}