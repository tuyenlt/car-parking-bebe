import { Module } from "@nestjs/common";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";
import { RepositoriesModule } from "src/repositories/repositories.module";
import { JwtModule } from "src/services/jwt/jwt.module";


@Module({  
  imports: [],
  controllers: [UserController],
  providers: [UserService],
})
export class ControllerModule {}