import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763898198328 implements MigrationInterface {
    name = 'Migrations1763898198328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar CHECK( "role" IN ('admin','user') ) NOT NULL DEFAULT ('user'), "refresh_token" varchar(500), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`CREATE TABLE "parking-lot" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "lot_code" varchar(255) NOT NULL, "lot_name" varchar(255) NOT NULL, "is_available" boolean NOT NULL DEFAULT (1), CONSTRAINT "UQ_5c234c723ebb7600fff7678c66b" UNIQUE ("lot_code"))`);
        await queryRunner.query(`CREATE TABLE "bill" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "bill_code" varchar(255) NOT NULL, "bill_time" datetime NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(255) NOT NULL, "description" varchar(255), "is_paid" boolean NOT NULL DEFAULT (0), "qr_code" varchar(255), CONSTRAINT "UQ_65e080814ef684970ae977cf1b1" UNIQUE ("bill_code"))`);
        await queryRunner.query(`CREATE TABLE "car-history" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "plate_number" varchar(255) NOT NULL, "entry_time" datetime NOT NULL, "exit_time" datetime, "entry_image" varchar(255), "exit_image" varchar(255), "entry_location" varchar(255) NOT NULL, "exit_location" varchar(255))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "car-history"`);
        await queryRunner.query(`DROP TABLE "bill"`);
        await queryRunner.query(`DROP TABLE "parking-lot"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
