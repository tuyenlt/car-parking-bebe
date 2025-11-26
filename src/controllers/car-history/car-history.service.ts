import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BillType, CAMERA_TYPE } from "src/common/constants/common.constant";
import { BillEntity } from "src/entities/bill.entity";
import { CarHistoryEntity } from "src/entities/car-history.entity";
import { CarHistoryRepository } from "src/repositories/car-history.repository";
import { BillService } from "../bill/bill.service";
import { IsNull } from "typeorm";
import { MqttBrokerService } from "src/mqtt/mqtt.service";
import { MQTT_CONTROL_COMMAND, MqttTopics } from "src/common/constants/mqtt.constant";
import { LoggerService } from "src/common/logger/logger.service";
import e from "express";
import { UserService } from "../user/user.service";


@Injectable()
export class CarHistoryService {
	constructor(
		private readonly carHistoryRepository: CarHistoryRepository,
		private readonly billService: BillService,
		private readonly mqttService: MqttBrokerService,
		private readonly logger : LoggerService,
		private readonly userService: UserService,
	) {}

	async findById(id: string) {
		return this.carHistoryRepository.findOneByFilter({id: id}, {}, ["bill"]);
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
		const carHistoryData = new CarHistoryEntity();
		carHistoryData.plate_number = results[0]?.plate || "UNKNOWN";
		if(carHistoryData.plate_number === null 
			|| carHistoryData.plate_number === undefined
			|| carHistoryData.plate_number === "UNKNOWN"
		){
			return { success: true };	// skip processing if plate number is unknown
		}
		if(camera_id === CAMERA_TYPE.ENTRY){
			this.logger.log('GATE','Processing entry gate for plate number: ' + carHistoryData.plate_number);
			const lastestEntry = await this.carHistoryRepository.getLastestEntryByPlateNumber(carHistoryData.plate_number);
			carHistoryData.entry_time = timestamp ? new Date(timestamp) : new Date();
			carHistoryData.entry_image = file_path;
			carHistoryData.entry_location = camera_id ;
			console.log('Lastest Entry:', lastestEntry);
			if(!lastestEntry || lastestEntry?.plate_number !== carHistoryData.plate_number){
				await this.carHistoryRepository.create(
					carHistoryData
				);
			}
			await this.mqttService.publish(MqttTopics.ENTRY_GATE_CONTROL, MQTT_CONTROL_COMMAND.OPEN_GATE);
		}
		if(camera_id === CAMERA_TYPE.EXIT){
			this.logger.log('GATE','Processing exit gate for plate number: ' + carHistoryData.plate_number);
			const existingRecord = await this.carHistoryRepository.findOneByFilter(
				{ 
					plate_number: carHistoryData.plate_number,
					exit_time: IsNull(), 
				},
				{},
				["bill"]
			);
			carHistoryData.exit_time = timestamp ? new Date(timestamp) : new Date();
			carHistoryData.exit_image = file_path;
			carHistoryData.exit_location = camera_id;
			if (existingRecord) {	
				
				if (existingRecord.bill !== null && existingRecord.bill != undefined) {
					this.logger.warn('GATE','Bill already exists for this car history');
					return { success: true, message: 'Bill already exists' };
				}
				
				existingRecord.exit_time = carHistoryData.exit_time;
				existingRecord.exit_image = carHistoryData.exit_image;
				existingRecord.exit_location = carHistoryData.exit_location;

				const lastestExit = await this.carHistoryRepository.getLastestExitByPlateNumber(carHistoryData.plate_number);
				console.log('Lastest Exit:', lastestExit);
				if(!lastestExit || lastestExit?.plate_number !== carHistoryData.plate_number){
					const bill = await this.createBillForCarHistory(existingRecord);
						existingRecord.bill = bill;
						await this.carHistoryRepository.create(existingRecord);
				}
				if(lastestExit && lastestExit?.plate_number === carHistoryData.plate_number){
					this.logger.warn('GATE','Exit record already exists for this plate number');
					this.mqttService.publish(MqttTopics.EXIT_GATE_CONTROL, MQTT_CONTROL_COMMAND.OPEN_GATE);
				}
			}
		}
		return { success: true };
	}

	private async createBillForCarHistory(carHistory: CarHistoryEntity) {
		const amount = await this.calculateParkingFee(carHistory);
		const code = randomUUID();
		const bill = new BillEntity();
		const billType = await this.getBillTypeForUser(carHistory.plate_number);
		const url = billType === BillType.MONTHLY ? '' : await this.billService.createVNPAYBill(amount, code , billType);
		bill.bill_type = billType;
		bill.vnp_url = url;
		bill.bill_code = code;
		bill.bill_time = new Date();
		bill.amount = billType === BillType.MONTHLY ? 0 : amount;
		bill.payment_method = "VNPAY";
		bill.description = `Parking fee for ${carHistory.plate_number}`;
		bill.is_paid = billType === BillType.MONTHLY ? true : false;
		bill.car_history = carHistory;
		return bill;
	}

	private async getBillTypeForUser(plateNumber: string): Promise<BillType> {
		const user = await this.userService.getUserByPlateNumber(plateNumber);
		if(user && user.is_membership_paid && user.start_date <= new Date() && user.end_date >= new Date()){
			return BillType.MONTHLY;
		}
		return BillType.TEMPORARY;
	}

	private async calculateParkingFee(carHistory: CarHistoryEntity): Promise<number> {
		if(!carHistory.exit_time || !carHistory.entry_time) {
			return 0;
		}
		const durationMs = carHistory.exit_time.getTime() - carHistory.entry_time.getTime();
		const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
		const feePerHour = 10000;
		if(durationHours <= 0) {
			return feePerHour;
		}
		return durationHours * feePerHour;
	}


	async deleteById(id: string) {
		return this.carHistoryRepository.delete(id);
	}

	async getCarHistoryByPlateNumber(plateNumber: string) {
		const results = this.carHistoryRepository.findByFilter({ plate_number: plateNumber }, {}, ["bill"]);
		return results;
	}
}