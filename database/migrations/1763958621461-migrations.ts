import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763958621461 implements MigrationInterface {
    name = 'Migrations1763958621461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_bill" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "bill_code" varchar(255) NOT NULL, "bill_time" datetime NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(255) NOT NULL, "description" varchar(255), "is_paid" boolean NOT NULL DEFAULT (0), "qr_code" varchar(255), "carHistoryId" varchar NOT NULL, CONSTRAINT "UQ_65e080814ef684970ae977cf1b1" UNIQUE ("bill_code"), CONSTRAINT "UQ_8bc949af4d0949696ad4538d833" UNIQUE ("carHistoryId"))`);
        await queryRunner.query(`INSERT INTO "temporary_bill"("id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code") SELECT "id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code" FROM "bill"`);
        await queryRunner.query(`DROP TABLE "bill"`);
        await queryRunner.query(`ALTER TABLE "temporary_bill" RENAME TO "bill"`);
        await queryRunner.query(`CREATE TABLE "temporary_bill" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "bill_code" varchar(255) NOT NULL, "bill_time" datetime NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(255) NOT NULL, "description" varchar(255), "is_paid" boolean NOT NULL DEFAULT (0), "qr_code" varchar(255), "carHistoryId" varchar NOT NULL, CONSTRAINT "UQ_65e080814ef684970ae977cf1b1" UNIQUE ("bill_code"), CONSTRAINT "UQ_8bc949af4d0949696ad4538d833" UNIQUE ("carHistoryId"), CONSTRAINT "FK_81009097ebabd6ea09e14ed165c" FOREIGN KEY ("carHistoryId") REFERENCES "car-history" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bill"("id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code", "carHistoryId") SELECT "id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code", "carHistoryId" FROM "bill"`);
        await queryRunner.query(`DROP TABLE "bill"`);
        await queryRunner.query(`ALTER TABLE "temporary_bill" RENAME TO "bill"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bill" RENAME TO "temporary_bill"`);
        await queryRunner.query(`CREATE TABLE "bill" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "bill_code" varchar(255) NOT NULL, "bill_time" datetime NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(255) NOT NULL, "description" varchar(255), "is_paid" boolean NOT NULL DEFAULT (0), "qr_code" varchar(255), "carHistoryId" varchar NOT NULL, CONSTRAINT "UQ_65e080814ef684970ae977cf1b1" UNIQUE ("bill_code"), CONSTRAINT "UQ_8bc949af4d0949696ad4538d833" UNIQUE ("carHistoryId"))`);
        await queryRunner.query(`INSERT INTO "bill"("id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code", "carHistoryId") SELECT "id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code", "carHistoryId" FROM "temporary_bill"`);
        await queryRunner.query(`DROP TABLE "temporary_bill"`);
        await queryRunner.query(`ALTER TABLE "bill" RENAME TO "temporary_bill"`);
        await queryRunner.query(`CREATE TABLE "bill" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "bill_code" varchar(255) NOT NULL, "bill_time" datetime NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(255) NOT NULL, "description" varchar(255), "is_paid" boolean NOT NULL DEFAULT (0), "qr_code" varchar(255), CONSTRAINT "UQ_65e080814ef684970ae977cf1b1" UNIQUE ("bill_code"))`);
        await queryRunner.query(`INSERT INTO "bill"("id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code") SELECT "id", "created_at", "updated_at", "deleted_at", "bill_code", "bill_time", "amount", "payment_method", "description", "is_paid", "qr_code" FROM "temporary_bill"`);
        await queryRunner.query(`DROP TABLE "temporary_bill"`);
    }

}
