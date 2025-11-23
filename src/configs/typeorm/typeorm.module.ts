import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

export const getTypeOrmModuleOptions = (): TypeOrmModuleOptions => ({
  type: process.env.DATABASE_ENGINE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "3000"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  schema: process.env.DATABASE_SCHEMA,

  entities: [__dirname + "/../../**/*.entity.{ts,js}"],
  migrations: [__dirname + "/../../database/migrations/**/*.{ts,js}"],

  synchronize: false,
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
