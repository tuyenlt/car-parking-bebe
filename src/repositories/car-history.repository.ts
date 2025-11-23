import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TABLE_NAMES } from "src/common/constants/common.constant";
import { CarHistoryEntity } from "src/entities/car-history.entity";
import { Repository } from "typeorm";
import { BaseCrudRepository } from "./base_crud.repository";


@Injectable()
export class CarHistoryRepository extends BaseCrudRepository<CarHistoryEntity> {
	constructor(
		@InjectRepository(CarHistoryEntity)
		private readonly carHistoryRepository: Repository<CarHistoryEntity>,
	) {
		super(carHistoryRepository,TABLE_NAMES.CAR_HISTORY);
	}
}