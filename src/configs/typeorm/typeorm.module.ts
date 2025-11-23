import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as path from "path";

export const getTypeOrmModuleOptions = (): TypeOrmModuleOptions => ({
  type: "better-sqlite3",

  database:
    process.env.SQLITE_DB ||
    path.join(__dirname, "..", "..", "..", "..", "database", "data", "database.sqlite"),

  synchronize: false,
  logging: false,

  entities: [path.join(__dirname, "..", "..", "entities", "**", "*.{ts,js}")],
  migrations: [path.join(__dirname, "..", "..", "database", "migrations", "**", "*.{ts,js}")],
  migrationsRun: true,
});


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
