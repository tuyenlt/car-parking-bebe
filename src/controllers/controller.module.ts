import { Module } from "@nestjs/common";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";
import { RepositoriesModule } from "src/repositories/repositories.module";
import { JwtModule } from "src/services/jwt/jwt.module";
import { ParkingLotService } from "./parking-lot/parking-lot.service";
import { ParkingLotController } from "./parking-lot/parking-lot.controller";
import { CarHistoryController } from "./car-history/car-history.controller";
import { CarHistoryService } from "./car-history/car-history.service";


@Module({  
  imports: [],
  controllers: [
	UserController, 
	ParkingLotController,
	CarHistoryController
  ],
  providers: [
	UserService, 
	ParkingLotService, 
	CarHistoryService
  ],
})
export class ControllerModule {}