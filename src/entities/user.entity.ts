import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { APP_ROLE } from "../common/constants/common.constant";
import { BillEntity } from "./bill.entity";


@Entity("user")
export class UserEntity extends BaseEntity{
    @Column({ type: "varchar", length: 255, unique: true })
    username: string;

    @Column({ type: "varchar", length: 255 })
    password: string;

	@Column({ type: "simple-enum", enum: APP_ROLE, default: APP_ROLE.USER })
	role: APP_ROLE;

	@Column({ type: "varchar", length: 255 , nullable: true })
	plate_number: string;

	@Column({ type: "datetime", nullable: true })
	start_date: Date;

	@Column({ type: "datetime", nullable: true })
	end_date: Date;

	@Column({ type: "boolean", nullable: true, default: false })
	is_membership_paid: boolean;

	@OneToMany(() => BillEntity, (bill) => bill.user_id)
	bills: BillEntity[];

	@Column({ type: "varchar", length: 500, nullable: true })
	refresh_token: string;
}