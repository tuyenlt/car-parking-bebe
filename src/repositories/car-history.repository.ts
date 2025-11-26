import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TABLE_NAMES } from "src/common/constants/common.constant";
import { CarHistoryEntity } from "src/entities/car-history.entity";
import { IsNull, Not, Repository } from "typeorm";
import { BaseCrudRepository } from "./base_crud.repository";


@Injectable()
export class CarHistoryRepository extends BaseCrudRepository<CarHistoryEntity> {
	constructor(
		@InjectRepository(CarHistoryEntity)
		private readonly carHistoryRepository: Repository<CarHistoryEntity>,
	) {
		super(carHistoryRepository,TABLE_NAMES.CAR_HISTORY);
	}

	async getLastestEntryByPlateNumber(plateNumber: string): Promise<CarHistoryEntity | null> {
		return this.carHistoryRepository.findOne({
			where: {  
				plate_number: plateNumber, 
				exit_time: IsNull(),
			},
			order: { created_at: "DESC" },
		});
	}

	async getLastestExitByPlateNumber(plateNumber: string): Promise<CarHistoryEntity | null> {
		return this.carHistoryRepository.findOne({
			where: { 
				plate_number: plateNumber, 
				exit_time: Not(IsNull()),
			},
			order: { created_at: "DESC" },
		});
	}
}