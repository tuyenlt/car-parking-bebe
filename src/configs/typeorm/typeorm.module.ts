import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

export const getTypeOrmModuleOptions = (
): TypeOrmModuleOptions =>
  ({
    type: process.env.DATABASE_ENGINE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "3000"),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + "./../../**/*.entity{.ts,.js}"],
    synchronize: false,
    schema: process.env.DATABASE_SCHEMA,
    migrationsRun: true,
    migrations: ["database/migrations/**/*{.ts,.js}"],
    subscribers: ["src/migrations"],
    seeds: ["database/seeds/**/*{.ts,.js}"],
  }) as TypeOrmModuleOptions;

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
