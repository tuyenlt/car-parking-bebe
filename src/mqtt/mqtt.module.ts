import { Module } from '@nestjs/common';
import { MqttBrokerService } from './mqtt.service';

@Module({
  providers: [MqttBrokerService],
  exports: [MqttBrokerService],
})
export class MqttModule {}
