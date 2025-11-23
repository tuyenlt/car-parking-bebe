import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const dataSourceOptions = {
  type: process.env.DATABASE_ENGINE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: ["src/**/*.entity{.ts,.js}"],

  synchronize: false,
  schema: process.env.DATABASE_SCHEMA,

  migrations: ["database/migrations/*{.ts,.js}"],
  seeds: ['database/seeds/*{.ts,.js}'],

  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);

// dataSource.initialize();

export default dataSource;
