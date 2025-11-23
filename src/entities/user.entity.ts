import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";
import { APP_ROLE } from "../common/constants/common.constant";


@Entity("user")
export class UserEntity extends BaseEntity{
    @Column({ type: "varchar", length: 255, unique: true })
    username: string;

    @Column({ type: "varchar", length: 255 })
    password: string;

	@Column({ type: "enum", enum: APP_ROLE, default: APP_ROLE.USER })
	role: APP_ROLE;

	@Column({ type: "varchar", length: 500, nullable: true })
	refresh_token: string;
}