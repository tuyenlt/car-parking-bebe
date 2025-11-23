import { Module } from '@nestjs/common';
import { MqttBrokerService } from './mqtt.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [],
  providers: [MqttBrokerService],
  exports: [MqttBrokerService],
})
export class MqttModule {}
