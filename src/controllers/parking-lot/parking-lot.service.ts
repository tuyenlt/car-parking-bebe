import { Injectable } from "@nestjs/common";
import { ParkingLotRepository } from "src/repositories/parking-lot.repository";


@Injectable()
export class ParkingLotService {
	constructor(
		private readonly parkingLotRepository: ParkingLotRepository,
	) {}

	async getLots() {
		return this.parkingLotRepository.findByFilter({});
	}
} 