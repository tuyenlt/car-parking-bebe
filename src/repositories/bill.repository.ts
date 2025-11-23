import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TABLE_NAMES } from "src/common/constants/common.constant";
import { BillEntity } from "src/entities/bill.entity";
import { Repository } from "typeorm";
import { BaseCrudRepository } from "./base_crud.repository";



@Injectable()
export class BillRepository extends BaseCrudRepository<BillEntity> {
	constructor(
		@InjectRepository(BillEntity)
		private readonly billRepository: Repository<BillEntity>,
	) {
		super(billRepository,TABLE_NAMES.BILL);
	}
}