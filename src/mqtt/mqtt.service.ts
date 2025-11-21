import { Injectable, OnModuleInit } from '@nestjs/common';
import Aedes from 'aedes';
import { createServer } from 'net';

@Injectable()
export class MqttBrokerService implements OnModuleInit {
  private broker = new Aedes();

  onModuleInit() {
    const server = createServer(this.broker.handle);
    const PORT = process.env.MQTT_PORT || 1883;

    server.listen(PORT, () => {
      console.log(`MQTT broker running on port ${PORT}`);
    });

    this.broker.on('client', client => {
      console.log(`Client connected: ${client.id}`);
    });

    this.broker.on('publish', (packet, client) => {
      if (client) {
        console.log(`Message from ${client.id}: ${packet.topic} -> ${packet.payload.toString()}`);
      }
    });
  }
}
