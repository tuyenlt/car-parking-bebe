import { Module } from "@nestjs/common";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";
import { RepositoriesModule } from "src/repositories/repositories.module";
import { JwtModule } from "src/services/jwt/jwt.module";
import { ParkingLotService } from "./parking-lot/parking-lot.service";
import { ParkingLotController } from "./parking-lot/parking-lot.controller";


@Module({  
  imports: [],
  controllers: [UserController, ParkingLotController],
  providers: [UserService, ParkingLotService],
})
export class ControllerModule {}