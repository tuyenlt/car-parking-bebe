import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigModule } from "src/configs/typeorm/typeorm.module";
import { BillEntity } from "src/entities/bill.entity";
import { CarHistoryEntity } from "src/entities/car-history.entity";
import { ParkingLotEntity } from "src/entities/parking-lot.entity";
import { UserEntity } from "src/entities/user.entity";
import { CarHistoryRepository } from "./car-history.repository";
import { ParkingLotRepository } from "./parking-lot.repository";
import { UserRepository } from "./user.repository";
import { BillRepository } from "./bill.repository";


@Module({
  imports: [
	TypeOrmConfigModule,
	TypeOrmModule.forFeature([
		UserEntity,
		ParkingLotEntity,
		CarHistoryEntity,
		BillEntity,
	]),
  ],
  providers: [
	// Repositories can be added here
	ParkingLotRepository,
	CarHistoryRepository,
	BillRepository,
	UserRepository,
  ],
  exports: [
	// Export repositories here
	ParkingLotRepository,
	CarHistoryRepository,
	BillRepository,
	UserRepository,
  ],
})
export class RepositoriesModule {}