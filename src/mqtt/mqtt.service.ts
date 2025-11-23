import { Injectable, OnModuleInit } from '@nestjs/common';
import Aedes, { PublishPacket } from 'aedes';
import { createServer } from 'net';
import { MqttTopics } from 'src/common/constants/mqtt.constant';
import { LoggerService } from 'src/common/logger/logger.service';
import { MqttParkingStatusPayload } from 'src/common/types/mqtt.type';
import { SocketEvents } from 'src/common/types/socket.type';
import { ParkingLotRepository } from 'src/repositories/parking-lot.repository';
import { SocketGateway } from 'src/socket/socket.gateway';


@Injectable()
export class MqttBrokerService implements OnModuleInit {
  constructor(
	private readonly logger: LoggerService,
	private readonly socketGateway: SocketGateway,
	private readonly parkingLotRepository: ParkingLotRepository,
  ) {}
  private broker = new Aedes();

  onModuleInit() {
    const server = createServer(this.broker.handle);
    const PORT = process.env.MQTT_PORT || 1883;

    server.listen(PORT, () => {
      this.logger.log("MQTT",`MQTT broker running on port ${PORT}`);
    });

    this.broker.on('client', client => {
      this.logger.log("MQTT",`Client connected: ${client.id}`);
    });

    this.broker.on('publish', async (packet, client) => {
      if (client) {
        this.logger.log("MQTT",`Message from ${client.id}: ${packet.topic} -> ${packet.payload.toString()}`);
		await this.routeTopicHandler(packet.topic, packet.payload.toString());
      }
    });
  }

  private async routeTopicHandler(topic: string, message: string) {
	this.logger.log("MQTT",`Received message: ${topic} -> ${message}`);
	try {	
		switch (topic) {
			case MqttTopics.PARKING_STATUS:
			await this.onParkingSpotUpdate(message);
			break;
		default:
			this.logger.warn("MQTT",`No handler for topic: ${topic}`);
			break;
		}
	} catch (error) {
		this.logger.error("MQTT",`Error handling topic ${topic}: ${error.message}`);
	}
  }

  async publish(topic: string, message: string) {
	this.broker.publish({ topic, payload: message } as PublishPacket, (err) => {
	  if (err) {
		this.logger.error("MQTT",`Failed to publish message to ${topic}: ${err.message}`);
	  } else {
		this.logger.log("MQTT",`Message published to ${topic}: ${message}`);
	  }
	});
  }

  private async onParkingSpotUpdate(message: string) {
	const data : MqttParkingStatusPayload[] = JSON.parse(message);
	for (const code of Object.keys(data)) {
		const is_available = data[code];
		await this.parkingLotRepository.updateBy({lot_code: code}, { is_available });
	}
	await this.socketGateway.emitEvent(SocketEvents.PARKING_SPOT_UPDATE, data);
  }

};
