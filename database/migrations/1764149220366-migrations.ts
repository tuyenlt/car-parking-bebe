import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1764149220366 implements MigrationInterface {
    name = 'Migrations1764149220366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar CHECK( "role" IN ('admin','user','guest') ) NOT NULL DEFAULT ('user'), "refresh_token" varchar(500), "plate_number" varchar(255), "start_date" datetime, "end_date" datetime, "is_membership_paid" boolean DEFAULT (0), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "created_at", "updated_at", "deleted_at", "username", "password", "role", "refresh_token", "plate_number", "start_date", "end_date", "is_membership_paid") SELECT "id", "created_at", "updated_at", "deleted_at", "username", "password", "role", "refresh_token", "plate_number", "start_date", "end_date", "is_membership_paid" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime DEFAULT (datetime('now')), "updated_at" datetime DEFAULT (datetime('now')), "deleted_at" datetime, "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar CHECK( "role" IN ('admin','user') ) NOT NULL DEFAULT ('user'), "refresh_token" varchar(500), "plate_number" varchar(255), "start_date" datetime, "end_date" datetime, "is_membership_paid" boolean DEFAULT (0), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "user"("id", "created_at", "updated_at", "deleted_at", "username", "password", "role", "refresh_token", "plate_number", "start_date", "end_date", "is_membership_paid") SELECT "id", "created_at", "updated_at", "deleted_at", "username", "password", "role", "refresh_token", "plate_number", "start_date", "end_date", "is_membership_paid" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
