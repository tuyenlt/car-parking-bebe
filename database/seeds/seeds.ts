import { UserEntity } from "../../src/entities/user.entity";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { APP_ROLE } from "../../src/common/constants/common.constant";
import * as path from "path";
import { ParkingLotEntity } from "../../src/entities/parking-lot.entity";
import { randomUUID } from "crypto";

const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.join(__dirname, "..", "data", "database.sqlite"),
  entities: [UserEntity, ParkingLotEntity],
  synchronize: false, 
  logging: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection initialized");

    // Seed Users
    const userRepo = AppDataSource.getRepository(UserEntity);

    // Check if data already exists
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log("⏭️  User data already exists, skipping seed...");
    } else {
      // Hash passwords
      const adminPassword = await bcrypt.hash("admin123", 10);
      const userPassword = await bcrypt.hash("user123", 10);

      const userData = [
        { 
          id: randomUUID(),
          username: "admin", 
          password: adminPassword, 
          role: APP_ROLE.ADMIN
        },
        { 
          id: randomUUID(),
          username: "user1", 
          password: userPassword, 
          role: APP_ROLE.USER
        },
        { 
          id: randomUUID(),
          username: "user2", 
          password: userPassword, 
          role: APP_ROLE.USER
        },
      ];

      await userRepo.save(userData);
      console.log(`✅ Seeded ${userData.length} users successfully.`);
      console.log("Default credentials:");
      console.log("  Admin - username: admin, password: admin123");
      console.log("  Users - username: user1/user2, password: user123");
    }

    // Seed Parking Lots
    const lotRepo = AppDataSource.getRepository(ParkingLotEntity);
    
    // Check if data already exists
    const existingLots = await lotRepo.count();
    if (existingLots > 0) {
      console.log("⏭️  ParkingLot data already exists, skipping seed...");
    } else {
      const lotData = [
        { id: randomUUID(), lot_code: "A1", lot_name: "Gate A1", is_available: true },
        { id: randomUUID(), lot_code: "A2", lot_name: "Gate A2", is_available: true },
        { id: randomUUID(), lot_code: "A3", lot_name: "Gate A3", is_available: true },
        { id: randomUUID(), lot_code: "B1", lot_name: "Gate B1", is_available: true },
        { id: randomUUID(), lot_code: "B2", lot_name: "Gate B2", is_available: true },
        { id: randomUUID(), lot_code: "B3", lot_name: "Gate B3", is_available: true },
      ];

      await lotRepo.save(lotData);
      console.log(`✅ Seeded ${lotData.length} parking lots successfully.`);
    }

    console.log("\n🎉 Seeding completed successfully!");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();