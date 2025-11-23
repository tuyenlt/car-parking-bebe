import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763796690913 implements MigrationInterface {
    name = 'Migrations1763796690913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`refresh_token\` varchar(500) NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bill\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`bill_code\` varchar(255) NOT NULL, \`bill_time\` timestamp NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`is_paid\` tinyint NOT NULL DEFAULT 0, \`qr_code\` varchar(255) NULL, UNIQUE INDEX \`IDX_65e080814ef684970ae977cf1b\` (\`bill_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`car-history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`plate_number\` varchar(255) NOT NULL, \`entry_time\` timestamp NOT NULL, \`exit_time\` timestamp NULL, \`entry_image\` varchar(255) NULL, \`exit_image\` varchar(255) NULL, \`entry_location\` varchar(255) NOT NULL, \`exit_location\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`parking-lot\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`lot_code\` varchar(255) NOT NULL, \`lot_name\` varchar(255) NOT NULL, \`is_available\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_5c234c723ebb7600fff7678c66\` (\`lot_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_5c234c723ebb7600fff7678c66\` ON \`parking-lot\``);
        await queryRunner.query(`DROP TABLE \`parking-lot\``);
        await queryRunner.query(`DROP TABLE \`car-history\``);
        await queryRunner.query(`DROP INDEX \`IDX_65e080814ef684970ae977cf1b\` ON \`bill\``);
        await queryRunner.query(`DROP TABLE \`bill\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
