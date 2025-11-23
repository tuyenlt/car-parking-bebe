import { ParkingLotEntity } from "../../src/entities/parking-lot.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";


export default class ParkingLotSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(ParkingLotEntity);

    // Check if data already exists
    const existingLots = await repository.count();
    if (existingLots > 0) {
      console.log("ParkingLot data already exists, skipping seed...");
      return;
    }

    const lotData = [
      { lot_code: "A1", lot_name: "Gate A1", is_available: true },
	  { lot_code: "A2", lot_name: "Gate A2", is_available: true },
	  { lot_code: "A3", lot_name: "Gate A3", is_available: true },
	  { lot_code: "B1", lot_name: "Gate B1", is_available: true },
	  { lot_code: "B2", lot_name: "Gate B2", is_available: true },
	  { lot_code: "B3", lot_name: "Gate B3", is_available: true },
    ];

    await repository.save(lotData);
    console.log(`Seeded ${lotData.length} parking lots successfully.`);
  }
}
