import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1766832868346 implements MigrationInterface {
    name = 'SchemaUpdate1766832868346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isOAuthUser"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "merchants" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "merchants" ADD CONSTRAINT "UQ_c4199d0353747c821386791f813" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "UQ_737991e10350d9626f592894cef" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "merchants" ADD CONSTRAINT "FK_c4199d0353747c821386791f813" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_737991e10350d9626f592894cef" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_737991e10350d9626f592894cef"`);
        await queryRunner.query(`ALTER TABLE "merchants" DROP CONSTRAINT "FK_c4199d0353747c821386791f813"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "UQ_737991e10350d9626f592894cef"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "merchants" DROP CONSTRAINT "UQ_c4199d0353747c821386791f813"`);
        await queryRunner.query(`ALTER TABLE "merchants" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "providerId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isOAuthUser" boolean NOT NULL DEFAULT false`);
    }

}
