import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TABLE_NAMES } from "src/common/constants/common.constant";
import { ParkingLotEntity } from "src/entities/parking-lot.entity";
import { Repository } from "typeorm";
import { BaseCrudRepository } from "./base_crud.repository";



@Injectable()
export class ParkingLotRepository extends BaseCrudRepository<ParkingLotEntity> {
	constructor(
		@InjectRepository(ParkingLotEntity)
		private readonly parkingLotRepository: Repository<ParkingLotEntity>,
	) {
		super(parkingLotRepository,TABLE_NAMES.PARKING_LOT);
	}
}