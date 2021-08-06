import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlockBalancesTable1628154618225 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
    CREATE TABLE block_balances (
        "id" VARCHAR(64) PRIMARY KEY NOT NULL,
        "agree" TEXT NOT NULL,
        "disagree" TEXT NOT NULL,
        "blockId" VARCHAR(64) NOT NULL
    );
`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("block_balances");
	}
}
