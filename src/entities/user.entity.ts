import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";


@Entity("user")
export class User extends BaseEntity{
    @Column({ type: "varchar", length: 255, unique: true })
    username: string;

    @Column({ type: "varchar", length: 255 })
    password: string;

}