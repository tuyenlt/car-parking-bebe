import { Global, Module } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { ControllerModule } from './controllers/controller.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { MqttModule } from './mqtt/mqtt.module';
import { JwtModule } from './services/jwt/jwt.module';
import { SocketGatewayModule } from './socket/socket-gateway.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Global()
@Module({
  imports: [
	ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..', 'uploads'), 
      serveRoot: '/api/v1/uploads',
    }),
	LoggerModule,
	ControllerModule,
	MqttModule,
	RepositoriesModule,
	JwtModule,
	SocketGatewayModule,
  ],
  providers: [],
  exports: [
	LoggerModule,
	MqttModule,
	JwtModule,
	RepositoriesModule,
	SocketGatewayModule,
  ],
})
export class AppModule {}
