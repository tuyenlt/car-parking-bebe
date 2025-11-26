import { Controller, Get } from "@nestjs/common";
import { ParkingLotService } from "./parking-lot.service";


@Controller("parking-lot")
export class ParkingLotController {
	constructor(
		private readonly parkingLotService: ParkingLotService,
	){}
	@Get("/")
	async getLots() {
		return this.parkingLotService.getLots();
	}
}