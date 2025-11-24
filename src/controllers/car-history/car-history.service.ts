import { Injectable } from "@nestjs/common";
import { CarHistoryRepository } from "src/repositories/car-history.repository";


@Injectable()
export class CarHistoryService {
	constructor(
		private readonly carHistoryRepository: CarHistoryRepository,
	) {}

	async findByPlateNumber(plateNumber: string) {
		return this.carHistoryRepository.findOneByFilter({ plate_number: plateNumber }, {}, ["bill"]);
	}

	async findById(id: string) {
		return this.carHistoryRepository.findOneByFilter(id, {}, ["bill"]);
	}

	async getListHistories() {
		return this.carHistoryRepository.findByFilter({}, {}, ["bill"]);
	}

	async handlePlateRecognitionHook(
		file_path: string,
		timestamp: string,
		camera_id: string | undefined | null,
		results: any,
	) {
		console.log("Handle plate recognition hook:", {
			file_path,
			timestamp,
			camera_id,
			results,
		});
		// Implement logic to save the car history based on recognition results
		return { success: true };
	}
}