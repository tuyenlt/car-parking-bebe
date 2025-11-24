import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BillEntity } from "./bill.entity";


@Entity("car-history")
export class CarHistoryEntity extends BaseEntity{
    @Column({ type: "varchar", length: 255 })
    plate_number: string;

    @Column({ type: "datetime" })
    entry_time: Date;

    @Column({ type: "datetime", nullable: true })
    exit_time: Date;

    @Column({ type: "varchar", length: 255, nullable: true })
    entry_image: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    exit_image: string;

    @Column({ type: "varchar", length: 255 })
    entry_location: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    exit_location: string;

    @OneToOne(() => BillEntity, (bill) => bill.car_history, { nullable: true, cascade: true })
    bill: BillEntity;
}