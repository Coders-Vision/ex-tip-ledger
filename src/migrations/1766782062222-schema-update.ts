import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1766782062222 implements MigrationInterface {
    name = 'SchemaUpdate1766782062222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tip_intents" ADD "tableCode" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tip_intents" DROP COLUMN "tableCode"`);
    }

}
