import { Injectable } from "@nestjs/common";
import { BaseCrudRepository } from "./base_crud.repository";
import { UserEntity } from "src/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TABLE_NAMES } from "src/common/constants/common.constant";


@Injectable()
export class UserRepository extends BaseCrudRepository<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {
		super(userRepository,TABLE_NAMES.USER);
	}
}