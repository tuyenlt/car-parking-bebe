import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { CarHistoryEntity } from "./car-history.entity";
import { BaseEntity } from "./base-entity";
import { BillType } from "../common/constants/common.constant";
import { UserEntity } from "./user.entity";


@Entity("bill")
export class BillEntity extends BaseEntity {
    @Column({ type: "varchar", length: 255 , unique: true })
    bill_code: string;

    @Column({ type: "datetime" })
    bill_time: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    @Column({ type: "varchar", length: 255 })
    payment_method: string;

	@Column({ type: "varchar", length: 255 , nullable: true })
    vnp_url: string;

	@Column({ type: "varchar", length: 255, nullable: true })
	transaction_no: string;

	@Column({ type: "varchar", length: 255, nullable: true })
	bank_code: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    description: string;

    @Column({ type: "boolean", default: false })
    is_paid: boolean;

	@Column({ type: "simple-enum", enum: BillType, default: BillType.TEMPORARY })
	bill_type: BillType;

    @OneToOne(() => CarHistoryEntity, (carHistory) => carHistory.bill, { nullable: true })
	@JoinColumn({ name: "car_history_id" })
    car_history: CarHistoryEntity;

	@ManyToOne(() => UserEntity , { nullable: true })
	@JoinColumn({ name: "user_id" })
	user_id: string;
}