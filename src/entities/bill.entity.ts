import { BaseEntity, Column, Entity, OneToOne } from "typeorm";
import { CarHistory } from "./car-histoty.entity";


@Entity("bill")
export class Bill extends BaseEntity {
    @Column({ type: "varchar", length: 255 , unique: true })
    bill_code: string;

    @Column({ type: "timestamp" })
    bill_time: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    @Column({ type: "varchar", length: 255 })
    payment_method: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    description: string;

    @Column({type: "boolean", default: false})
    is_paid: boolean;

    @Column({ type: "varchar", length: 255 , nullable: true })
    qr_code: string;

    @OneToOne(() => CarHistory, (carHistory) => carHistory.id, { nullable: false })
    car_history: CarHistory;
}