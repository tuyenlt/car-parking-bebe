import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";



@Entity("parking-lot")
export class ParkingLot extends BaseEntity {
    @Column({ type: "varchar", length: 255, unique: true })
    lot_code: string;

    @Column({ type: "varchar", length: 255 })
    lot_name: string;

    @Column({ type: "boolean", default: true })
    is_available: boolean;
}