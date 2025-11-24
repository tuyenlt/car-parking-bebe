import { Injectable } from "@nestjs/common";
import { MqttTopics } from "src/common/constants/mqtt.constant";
import { LoggerService } from "src/common/logger/logger.service";
import { BillEntity } from "src/entities/bill.entity";
import { MqttBrokerService } from "src/mqtt/mqtt.service";
import { BillRepository } from "src/repositories/bill.repository";
import { dateFormat, HashAlgorithm, ProductCode, VNPay, VnpLocale } from "vnpay";


@Injectable()
export class BillService {
	constructor(
		private readonly billRepository: BillRepository,
		private readonly logger : LoggerService,
		private readonly mqtt : MqttBrokerService,
	) {} 
	
	async create(billData: BillEntity) {
		return this.billRepository.create(billData);
	}

	async createVNPAYBill(amount : number, code : string): Promise<any> {
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
			vnp_OrderInfo: `Payment for bill ${code}`,
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
		await this.billRepository.update(bill.id, bill);
		await this.mqtt.publish(MqttTopics.EXIT_GATE_CONTROL, "OPEN_GATE");

		return { success: true, message: "Thanh Toán Thành Công", bill };

	}
}