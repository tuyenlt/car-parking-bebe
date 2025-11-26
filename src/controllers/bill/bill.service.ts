import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BillType } from "src/common/constants/common.constant";
import { MqttTopics } from "src/common/constants/mqtt.constant";
import { LoggerService } from "src/common/logger/logger.service";
import { BillEntity } from "src/entities/bill.entity";
import { UserEntity } from "src/entities/user.entity";
import { MqttBrokerService } from "src/mqtt/mqtt.service";
import { BillRepository } from "src/repositories/bill.repository";
import { UserRepository } from "src/repositories/user.repository";
import { dateFormat, HashAlgorithm, ProductCode, VNPay, VnpLocale } from "vnpay";


@Injectable()
export class BillService {
	constructor(
		private readonly billRepository: BillRepository,
		private readonly logger : LoggerService,
		private readonly mqtt : MqttBrokerService,
		private readonly userRepository: UserRepository,
	) {} 
	
	async create(billData: BillEntity) {
		return this.billRepository.create(billData);
	}

	async createBillForUserMembershipPayment(user : UserEntity, amount: number): Promise<BillEntity> {
		const billCode = randomUUID();
		const bill = new BillEntity();
		bill.user_id = user.id;
		bill.amount = amount;
		bill.bill_type = BillType.MEMBER_SHIP_PAY;
		bill.bill_code = billCode;
		bill.bill_time = new Date();
		bill.payment_method = "VNPAY";
		bill.vnp_url = await this.createVNPAYBill(amount, billCode , BillType.MEMBER_SHIP_PAY);
		return this.billRepository.create(bill);
	}

	async createVNPAYBill(amount : number, code : string, type : BillType): Promise<any> {
		const vnpay = new VNPay({
			tmnCode: process.env.VNP_TMNCODE || '',
			secureSecret: process.env.VNP_HASHSECRET || '',
			testMode: true,
			vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
			hashAlgorithm: HashAlgorithm.SHA512,
			loggerFn: (msg: string) => {
				this.logger.log("VNPAY", msg); 
			},
		});

		const vnpayUrl = vnpay.buildPaymentUrl({
			vnp_Amount: amount, 
			vnp_TxnRef: code,
			vnp_IpAddr: process.env.VNP_IPADDR || '',
			vnp_OrderInfo: `Payment for bill code: ${code}, type: ${type}`,
			vnp_OrderType : ProductCode.Other,
			vnp_ReturnUrl: process.env.VNP_RETURNURL || '',
			vnp_Locale: VnpLocale.VN,
			vnp_CreateDate: dateFormat(new Date()),
			vnp_ExpireDate: dateFormat(new Date(Date.now() + 48 * 60 * 60 * 1000)),
		});

		return vnpayUrl;
	}	

	async handleReturnVNPAY(queryParams: any): Promise<any> {
		const {
		vnp_TxnRef,
		vnp_Amount,
		vnp_BankCode,
		vnp_BankTranNo,
		vnp_CardType,
		vnp_OrderInfo,
		vnp_PayDate,
		} = queryParams;
		
		const bill = await this.billRepository.findOneByFilter({ bill_code: vnp_TxnRef });
		if (!bill) {
			return { success: false, message: "Bill not found" };
		}

		if (bill.is_paid) {
			return { success: true,  message: "Thanh Toán Thành Công", bill  };
		}
		bill.transaction_no = vnp_BankTranNo;
		bill.bank_code = vnp_BankCode;
		bill.is_paid = true;
		bill.payment_method = "VNPAY";
		bill.amount = vnp_Amount / 100; 
		bill.description = `Paid via VNPAY. Bank: ${vnp_BankCode}, Transaction No: ${vnp_BankTranNo}, Card Type: ${vnp_CardType}, Pay Date: ${vnp_PayDate}`;
		if(bill.bill_type === BillType.MEMBER_SHIP_PAY){
			const user = await this.userRepository.findOneByFilter({ id: bill.user_id });
			if(user){
				user.is_membership_paid = true;
				await this.userRepository.update(user.id, user);
			}
			await this.billRepository.update(bill.id, bill);
			return { success: true, message: "Thanh Toán Thành Công", bill };
		}
		await this.billRepository.update(bill.id, bill);
		await this.mqtt.publish(MqttTopics.EXIT_GATE_CONTROL, "OPEN_GATE");

		return { success: true, message: "Thanh Toán Thành Công", bill };

	}

	async getLatestMembershipBillForUser(userId: string) {
		const queryBuilder = this.billRepository.createQueryBuilder();
		const bill = await queryBuilder
			.where("bill.user_id = :userId", { userId })
			.andWhere("bill.bill_type = :billType", { billType: BillType.MEMBER_SHIP_PAY })
			.orderBy("bill.bill_time", "DESC")
			.getOne();	
		return bill;
	}
}