import { UserEntity } from "../../src/entities/user.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import * as bcrypt from "bcrypt";
import { APP_ROLE } from "../../src/common/constants/common.constant";


export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(UserEntity);

    // Check if data already exists
    const existingUsers = await repository.count();
    if (existingUsers > 0) {
      console.log("User data already exists, skipping seed...");
      return;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const userData = [
      { 
        username: "admin", 
        password: adminPassword, 
        role: APP_ROLE.ADMIN
      },
      { 
        username: "user1", 
        password: userPassword, 
        role: APP_ROLE.USER
      },
      { 
        username: "user2", 
        password: userPassword, 
        role: APP_ROLE.USER
      },
    ];

    await repository.save(userData);
    console.log(`Seeded ${userData.length} users successfully.`);
    console.log("Default credentials:");
    console.log("  Admin - username: admin, password: admin123");
    console.log("  Users - username: user1/user2, password: user123");
  }
}