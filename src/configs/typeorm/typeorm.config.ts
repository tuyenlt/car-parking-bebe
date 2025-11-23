import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: ".env" });

const dataSource = new DataSource({
  type: "better-sqlite3",

  database:
	process.env.SQLITE_DB ||
	path.join(__dirname, "..", "..", "..", "database", "data", "database.sqlite"),

  synchronize: false,
  logging: false,

  entities: [path.join(__dirname, "..", "..", "entities", "*.{ts,js}")],
  migrations: [path.join(__dirname, "..", "..", "..", "database", "migrations", "*.{ts,js}")],
  migrationsRun: true,
});

console.log("Database Path:", dataSource.options.entities);

// dataSource.initialize();

export default dataSource;
